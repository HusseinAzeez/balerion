import * as crypto from 'crypto';
import {
  ForbiddenException,
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as argon from 'argon2';

import { User } from '@/db/entities/user.entity';
import { UserRole, UserStatus } from '@/common/enums/user.enum';

import { AuthDto, VerifyUserOtpDto } from './dto';
import { Tokens } from './types';
import { jwtConstants } from './constants';
import { Staff } from '@/db/entities/staff.entity';
import { StaffStatus } from '@/common/enums/staff.eum';
import { VerifyStaffOtpDto } from './dto/verify-staff-token.dto';
import { ResendStaffOTPDto } from './dto/resend-staff-otp.dto';
import { EmailService } from '../email/email.service';
import { ISocialProfile } from '@/common/interfaces/user.interface';
import { ThaiBulkSmsService } from '@/services/thaibulksms.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private readonly emailService: EmailService,
    private readonly thaiBulkSmsService: ThaiBulkSmsService,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Staff)
    private readonly staffRepository: Repository<Staff>,
  ) {}

  validateUser(user: User): void {
    if (!user) throw new NotFoundException('User not found');
    if (user.role == UserRole.PRIVATE && user.status !== UserStatus.VERIFIED) {
      throw new BadRequestException('The User is not verified');
    }
    if (
      user.role == UserRole.DEALER &&
      [UserStatus.INACTIVE, UserStatus.INVITED].includes(user.status)
    ) {
      throw new BadRequestException('The User is inactive or invited');
    }
  }

  async login(dto: AuthDto): Promise<Tokens> {
    const user = await this.userRepository.findOne({
      select: {
        id: true,
        email: true,
        password: true,
        status: true,
        role: true,
      },
      where: {
        email: dto.email,
      },
    });

    this.validateUser(user);

    if (!(await argon.verify(user.password, dto.password)))
      throw new BadRequestException('The provided password does not match');

    const tokens = await this.generateTokens(user);
    await this.hashAndUpdateRefreshToken(user, tokens.refreshToken);

    return tokens;
  }

  async logout(userId: number): Promise<boolean> {
    await this.userRepository.update(userId, { hashedRefreshToken: null });
    return true;
  }

  async refreshTokens(id: number, refreshToken: string): Promise<Tokens> {
    const user = await this.userRepository.findOne({ where: { id: id } });

    if (!user) throw new BadRequestException('User does not exists');

    if (!user.hashedRefreshToken)
      throw new ForbiddenException(
        'User does not have a refresh token. Please login first',
      );

    const refreshTokenMatches = await argon.verify(
      user.hashedRefreshToken,
      refreshToken,
    );

    if (!refreshTokenMatches)
      throw new ForbiddenException(
        "The provided refresh token do no match the user's stored refresh token",
      );

    const tokens = await this.generateTokens(user);
    await this.hashAndUpdateRefreshToken(user, tokens.refreshToken);

    return tokens;
  }

  private async hashAndUpdateRefreshToken(user: User, refreshToken: string) {
    user.hashedRefreshToken = await argon.hash(refreshToken);
    user.lastSignInAt = new Date();

    return await this.userRepository.save(user);
  }

  async hashAndUpdateStaffRefreshToken(staff: Staff, refreshToken: string) {
    staff.hashedRefreshToken = await argon.hash(refreshToken);
    staff.lastSignInAt = new Date();

    return await this.staffRepository.save(staff);
  }

  // user type can be User or Staff
  async generateTokens(user): Promise<Tokens> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: user.id,
          email: user.email,
        },
        {
          secret: jwtConstants.secret,
          expiresIn: '24h',
        },
      ),
      this.jwtService.signAsync(
        {
          sub: user.id,
          email: user.email,
        },
        {
          secret: jwtConstants.secret,
          expiresIn: '7d',
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    } as Tokens;
  }

  async validateStaff(dto: AuthDto): Promise<Staff> {
    const staff = await this.staffRepository.findOne({
      select: {
        id: true,
        email: true,
        password: true,
        status: true,
        role: true,
      },
      where: {
        email: dto.email,
      },
    });

    if (!staff) throw new NotFoundException('The Staff not found');
    if (staff.status !== StaffStatus.VERIFIED) {
      throw new BadRequestException('The Staff is not verified');
    }
    if (!staff.password)
      throw new NotFoundException('The Staff password not found');

    if (!(await argon.verify(staff.password, dto.password)))
      throw new BadRequestException(
        'Email or password is incorrect. Please recheck and try again',
      );

    return staff;
  }

  async staffLogin(dto: AuthDto) {
    const staff = await this.validateStaff(dto);

    const date = new Date();
    date.setMinutes(date.getMinutes() + 5);

    staff.otp = Math.floor(1000 + Math.random() * 9000).toString();
    staff.otpRefNo = crypto.randomBytes(3).toString('hex');
    staff.otpExpiredAt = date;
    const saveStaff = await this.staffRepository.save(staff);

    await this.emailService.otpVerification(
      dto.email,
      staff.otp,
      saveStaff.otpRefNo,
    );
    return { otpRefNo: saveStaff.otpRefNo };
  }

  async verifyStaff(dto: VerifyStaffOtpDto): Promise<Tokens> {
    const { email, otp, otpRefNo } = dto;
    const date = new Date();
    const staff = await this.staffRepository.findOne({
      where: { email, otpRefNo },
    });

    if (!staff) throw new NotFoundException('The Staff not found.');
    if (staff.otpExpiredAt < date)
      throw new BadRequestException(
        'The verification code has expired. Please try to login again.',
      );
    if (staff.otp !== otp) throw new BadRequestException('Wrong OTP entered');

    staff.otp = null;
    staff.otpRefNo = null;
    staff.otpExpiredAt = null;

    const tokens = await this.generateTokens(staff);
    await this.hashAndUpdateStaffRefreshToken(staff, tokens.refreshToken);
    return tokens;
  }

  async resendOtp(dto: ResendStaffOTPDto) {
    const staff = await this.staffRepository.findOne({
      where: { email: dto.email },
    });

    if (!staff) {
      throw new NotFoundException('Staff not found');
    }

    if (staff.status !== StaffStatus.VERIFIED) {
      throw new NotFoundException('Staff is not verified');
    }

    const currentDate = new Date();
    currentDate.setMinutes(currentDate.getMinutes() + 5);

    staff.otp = Math.floor(1000 + Math.random() * 9000).toString();
    staff.otpRefNo = crypto.randomBytes(3).toString('hex');
    staff.otpExpiredAt = currentDate;

    await this.staffRepository.save(staff);

    await this.emailService.otpVerification(
      dto.email,
      staff.otp,
      staff.otpRefNo,
    );

    return { otpRefNo: staff.otpRefNo };
  }

  async requestOTP(currentUserId: number) {
    const user = await this.userRepository.findOne({
      where: { id: currentUserId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.status !== UserStatus.VERIFIED) {
      throw new BadRequestException('User is not verified');
    }

    if (!user.phoneNumber) {
      throw new BadRequestException('User has no phone number');
    }

    const response = await this.thaiBulkSmsService.requestOTP(user.phoneNumber);

    user.verifiedPhoneNumberToken = response.token;

    await this.userRepository.save(user);

    return response;
  }

  async verifyOtp(dto: VerifyUserOtpDto, currentUserId: number) {
    const user = await this.userRepository.findOne({
      where: { id: currentUserId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const response = await this.thaiBulkSmsService.verifyOTP(
      dto.otp,
      user.verifiedPhoneNumberToken,
    );

    if (response.status !== 'success') {
      throw new BadRequestException('Wrong OTP entered');
    }

    user.verifiedPhoneNumber = user.phoneNumber;
    user.verifiedPhoneNumberToken = null;
    await this.userRepository.save(user);

    return response;
  }

  async isVerified(currentUserId: number) {
    const user = await this.userRepository.findOne({
      where: { id: currentUserId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (
      user.phoneNumber &&
      user.verifiedPhoneNumber &&
      user.phoneNumber === user.verifiedPhoneNumber
    ) {
      return { verified: true };
    }

    return { verified: false };
  }

  async staffLogout(userId: number): Promise<boolean> {
    await this.staffRepository.update(userId, { hashedRefreshToken: null });
    return true;
  }

  async staffRefreshTokens(id: number, refreshToken: string): Promise<Tokens> {
    const staff = await this.staffRepository.findOne({ where: { id: id } });

    if (!staff) throw new BadRequestException('User does not exists');

    if (!staff.hashedRefreshToken)
      throw new ForbiddenException(
        'Staff does not have a refresh token. Please login first',
      );

    const refreshTokenMatches = await argon.verify(
      staff.hashedRefreshToken,
      refreshToken,
    );

    if (!refreshTokenMatches)
      throw new ForbiddenException(
        "The provided refresh token do no match the staff's stored refresh token",
      );

    const tokens = await this.generateTokens(staff);
    await this.hashAndUpdateStaffRefreshToken(staff, tokens.refreshToken);

    return tokens;
  }

  async loginWithSocial(userProvider: ISocialProfile) {
    const { uid, providerType } = userProvider;

    const user = await this.userRepository.findOne({
      where: {
        authenticationProviders: {
          uid,
          providerType,
        },
      },
      select: {
        id: true,
        email: true,
        status: true,
        role: true,
      },
    });

    this.validateUser(user);

    const tokens = await this.generateTokens(user);
    await this.hashAndUpdateRefreshToken(user, tokens.refreshToken);

    return tokens;
  }
}
