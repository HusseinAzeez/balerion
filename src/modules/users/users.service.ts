import * as crypto from 'crypto';
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import * as argon from 'argon2';
import { isEmpty } from 'lodash';
import { extname } from 'path';

import { filenameBuffer } from '@/common/helpers/multer.helper';
import { UserRole, UserStatus } from '@/common/enums/user.enum';
import { User } from '@/db/entities/user.entity';
import { Attachment } from '@/db/entities/attachment.entity';
import { PaginationsService } from '../paginations/paginations.service';
import { S3FileService, StripeService } from '@/services';
import {
  CreateUsersDto,
  UpdateUserDto,
  SetupAccountDto,
  QueryUserDto,
  ChangePasswordDto,
} from './dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { EmailService } from '../email/email.service';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { CarsService } from '../cars/cars.service';
import { UploadUserAttachmentDto } from './dto/upload-user-attachment.dto';
import { UpdateCarByUserDto } from '../cars/dto/update-car-by-user.dto';
import { QueryCarByUserDto } from '../cars/dto/query-car-by-user.dto';
import { FindByTokenDto } from './dto/find-by-token.dto';
import { ChatProducer } from '../chats/producers/chat.producer';
import { SaveCarsService } from '../save-cars/save-cars.service';
import { CreateSaveCarDto } from '../save-cars/dto/create-save-car.dto';
import { QuerySaveCarDto } from '../cars/dto/query-save-car.dto';
import { RemoveSaveCarDto } from '../save-cars/dto/remove-save-car.dto';
import { MoveCarToBinDto } from '../cars/dto/move-car-to-bin.dto';
import { DeleteCarDto } from '../cars/dto/delete-car.dto';
import { UpdateUserByStaffDto } from './dto/update-user-by-staff.dto';
import { VouchersService } from '../vouchers/vouchers.service';
import { QueryVoucherByUserDto } from '../vouchers/dto/query-voucher-by-user.dto';
import { CreateUserSocialDto } from './dto/create-user-social.dto';
import { ISocialProfile } from '@/common/interfaces/user.interface';
import { CreateCarByUserDto } from '../cars/dto/create-car-by-user.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { StaffNotificationsService } from '../notifications/staff-notification.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly s3FileService: S3FileService,
    private readonly paginationsService: PaginationsService,
    private readonly emailService: EmailService,
    private readonly carsService: CarsService,
    private readonly stripeService: StripeService,
    private readonly chatProducer: ChatProducer,
    private readonly saveCarsService: SaveCarsService,
    private readonly voucherService: VouchersService,
    private readonly notificationsService: NotificationsService,
    private readonly staffNotificationService: StaffNotificationsService,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Attachment)
    private readonly attachmentRepository: Repository<Attachment>,
  ) {}

  async create(dto: CreateUsersDto) {
    const user = this.userRepository.create({
      ...dto,
    });
    return await this.userRepository.save(user);
  }

  async setupAccount(dto: SetupAccountDto, image: Express.Multer.File) {
    const {
      password,
      firstName,
      lastName,
      phoneNumber,
      lineId,
      province,
      district,
      zipCode,
      idCard,
      club,
      inviteToken,
      verifiedToken,
      attachments,
      dealerName,
      taxId,
    } = dto;
    let findUser: User;

    if (!inviteToken && !verifiedToken)
      throw new BadRequestException('not found token');

    if (inviteToken) {
      findUser = await this.userRepository.findOne({
        where: { inviteToken, inviteTokenExpiredAt: MoreThan(new Date()) },
      });
    }

    if (verifiedToken) {
      findUser = await this.userRepository.findOne({
        where: { verifiedToken },
      });
    }

    if (!findUser) {
      throw new NotFoundException('Account not found');
    }
    if (
      findUser.role == UserRole.PRIVATE &&
      findUser?.status == UserStatus.VERIFIED
    ) {
      throw new BadRequestException('User has already set up this account');
    }

    const dealerSetupStatus = [UserStatus.UNVERIFIED, UserStatus.INVITED];
    if (
      findUser.role == UserRole.DEALER &&
      !dealerSetupStatus.includes(findUser.status)
    ) {
      throw new BadRequestException('User has already set up this account');
    }

    const user = await this.userRepository.preload({
      id: findUser.id,
      firstName,
      lastName,
      phoneNumber,
      lineId,
      club,
      province,
      district,
      zipCode,
      attachments,
      dealerName,
      taxId,
      idCard,
    });

    if (findUser.status == UserStatus.INVITED) {
      user.inviteToken = null;
      user.inviteTokenExpiredAt = null;
    }

    if (findUser.role == UserRole.PRIVATE) {
      user.status = UserStatus.VERIFIED;
      user.verifiedAt = new Date();
      user.postLimit = 2;
    }

    if (findUser.role == UserRole.DEALER) {
      user.status = UserStatus.WAITING_APPROVE;
    }

    if (!findUser.stripeId) {
      user.stripeId = await this.stripeService.createCustomer(
        `${dto.firstName} ${dto.lastName}`,
        findUser.email,
        { role: findUser.role },
      );
    }

    user.password = await this.encryptPassword(password);
    user.verifiedToken = null;
    user.deletedAt = null;

    if (image) {
      const uploadedFile = await this.s3FileService.fileUpload(
        image,
        'images/users',
      );

      if (uploadedFile.location) {
        user.profileImageUrl = uploadedFile.location;
      }
    }

    const userResponse = await this.userRepository.save(user);

    if (userResponse.role === UserRole.DEALER)
      await this.staffNotificationService.createDealerNotification({
        name: userResponse.dealerName,
        userId: userResponse.id,
      });

    return userResponse;
  }

  async update(id: number, image: Express.Multer.File, dto: UpdateUserDto) {
    const {
      firstName,
      lastName,
      phoneNumber,
      status,
      deleteImage,
      lineId,
      club,
      idCard,
      province,
      district,
      zipCode,
      attachments,
    } = dto;

    const user = await this.userRepository.preload({
      id,
      firstName,
      lastName,
      phoneNumber,
      status,
      lineId,
      club,
      idCard,
      province,
      district,
      zipCode,
      attachments,
    });

    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }

    if (user.role === UserRole.DEALER && isEmpty(dto.attachments))
      throw new BadRequestException('Attachment PP20 should not be empty');

    if (image) {
      if (user.profileImageUrl) {
        const filename = user.profileImageUrl.split('/').pop();
        await this.s3FileService.removeFile(filename, 'users');
      }
      const uploadedFile = await this.s3FileService.fileUpload(image, 'users');

      if (uploadedFile.location) {
        user.profileImageUrl = uploadedFile.location;
      }
    } else if (deleteImage) {
      if (user.profileImageUrl) {
        const filename = user.profileImageUrl.split('/').pop();
        await this.s3FileService.removeFile(filename, 'users');
      }
      user.profileImageUrl = null;
    }

    const userDb = await this.userRepository.save(user);

    if (firstName || lastName || image || phoneNumber)
      await this.updateUserDataToFirebase(user.id);
    return userDb;
  }

  async updateByStaff(
    id: number,
    dto: UpdateUserByStaffDto,
    image: Express.Multer.File,
  ) {
    const { firstName, lastName, postLimit, deleteImage, phoneNumber } = dto;

    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }

    if (user.role === UserRole.DEALER && isEmpty(dto.attachments))
      throw new BadRequestException('Attachment PP20 should not be empty');

    if (image) {
      if (user.profileImageUrl) {
        const filename = user.profileImageUrl.split('/').pop();
        await this.s3FileService.removeFile(filename, 'users');
      }
      const uploadedFile = await this.s3FileService.fileUpload(image, 'users');

      if (uploadedFile.location) {
        user.profileImageUrl = uploadedFile.location;
      }
    } else if (deleteImage) {
      if (user.profileImageUrl) {
        const filename = user.profileImageUrl.split('/').pop();
        await this.s3FileService.removeFile(filename, 'users');
      }
      user.profileImageUrl = null;
    }

    user.postLimit = postLimit;

    const updatedUser = {
      ...user,
      ...dto,
    };

    const userDb = await this.userRepository.save(updatedUser);
    if (firstName || lastName || image || phoneNumber)
      await this.updateUserDataToFirebase(user.id);
    return userDb;
  }

  async resetPassword(dto: ResetPasswordDto) {
    const { resetPasswordToken, password } = dto;

    const user = await this.userRepository.findOne({
      where: { resetPasswordToken },
    });

    if (!user) throw new NotFoundException('User not found');

    user.password = await this.encryptPassword(password);
    user.resetPasswordToken = null;
    user.resetPasswordExpiredAt = null;

    return await this.userRepository.save(user);
  }

  async changePassword(currentUserId: number, dto: ChangePasswordDto) {
    const user = await this.userRepository
      .createQueryBuilder()
      .select('*')
      .where('id = :currentUserId', { currentUserId })
      .getRawOne();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!(await argon.verify(user.password, dto.password)))
      throw new BadRequestException('The provided password does not match');

    if (dto.newPassword !== dto.confirmNewPassword)
      throw new BadRequestException(
        'The provided password does not match confirm password',
      );

    user.password = await this.encryptPassword(dto.newPassword);
    return await this.userRepository.save(user);
  }

  async findAll(query: QueryUserDto) {
    const {
      limitPerPage,
      page,
      all,
      search,
      sortDirection,
      sortBy,
      status,
      role,
      searchByProvince,
    } = query;

    const userQuery = this.userRepository.createQueryBuilder('user');

    if (search) {
      userQuery.andWhere(
        `(user.email ILIKE :search OR
          user.firstName ILIKE :search OR
          user.lastName ILIKE :search OR
          CONCAT_WS(' ', user.firstName, user.lastName) ILIKE :search)`,
        {
          search: `%${search}%`,
        },
      );

      if (role === UserRole.DEALER) {
        userQuery.orWhere('user.dealerName ILIKE :search', {
          search: `%${search}%`,
        });
      }
    }

    if (searchByProvince) {
      userQuery.andWhere(`user.province = :searchByProvince`, {
        searchByProvince,
      });
    }
    if (role) {
      userQuery.andWhere(`user.role = :role`, { role });
    }

    if (!isEmpty(status)) {
      userQuery.andWhere('user.status IN (:...status)', { status });
    }

    if (sortBy === 'fullName') {
      userQuery.orderBy(`"user"."first_name"`, sortDirection as 'ASC' | 'DESC');
      userQuery.addOrderBy(
        `"user"."last_name"`,
        sortDirection as 'ASC' | 'DESC',
      );
    } else userQuery.orderBy(`${sortBy}`, sortDirection as 'ASC' | 'DESC');
    return await this.paginationsService.paginate(userQuery, {
      limitPerPage,
      all,
      page,
    });
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOne({
      where: { id: id },
      relations: {
        attachments: true,
        approvedBy: true,
        rejectionReasons: true,
      },
      order: {
        rejectionReasons: { createdAt: 'DESC' },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async profile(currentUserId: number) {
    return await this.userRepository.findOne({
      where: { id: currentUserId },
      relations: {
        attachments: true,
        approvedBy: true,
        rejectionReasons: true,
      },
      order: {
        rejectionReasons: { createdAt: 'DESC' },
      },
    });
  }

  private async encryptPassword(password: string) {
    return await argon.hash(password);
  }

  async register(dto: RegisterUserDto) {
    const { email, taxId } = dto;

    await this.validateEmailAndTaxId({ email, taxId });

    const createUser = this.userRepository.create(dto);

    const stripeCustomerId = await this.stripeService.createCustomer(
      `${dto.firstName} ${dto.lastName}`,
      email,
      { role: dto.role },
    );

    createUser.stripeId = stripeCustomerId;

    createUser.status = UserStatus.UNVERIFIED;
    createUser.verifiedToken = crypto.randomBytes(28).toString('hex');
    const fullName = `${dto.firstName} ${dto.lastName}`;
    this.emailService.sendUserVerifyToken(
      email,
      createUser.verifiedToken,
      fullName,
    );

    return await this.userRepository.save(createUser);
  }

  async forgetPassword(email: string) {
    const user = await this.userRepository
      .createQueryBuilder()
      .select('*')
      .where('email = :email', { email })
      .getRawOne();
    if (!user) {
      throw new NotFoundException(`User ${email} not found`);
    }

    const userStatusCanResetPassword = [
      'unverified',
      'invited',
      'inactive',
      'rejected',
      'verified',
    ];

    if (!userStatusCanResetPassword.includes(user.status)) {
      throw new BadRequestException(
        `User status is not ready to be reset password`,
      );
    }

    if (!user.password) {
      throw new NotFoundException(`User ${email} can't reset password`);
    }

    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() + 7);

    user.resetPasswordToken = crypto.randomBytes(28).toString('hex');
    user.resetPasswordExpiredAt = currentDate;

    await this.userRepository.save(user);
    const fullName = `${user.first_name} ${user.last_name}`;
    const isSendToStaff = false;

    await this.emailService.sendForgotPassword(
      email,
      user.resetPasswordToken,
      fullName,
      isSendToStaff,
    );

    return { message: 'An email has been sent to your email address' };
  }

  async createCar(dto: CreateCarByUserDto, currentUserId: number) {
    const user = await this.userRepository.findOne({
      where: { id: currentUserId },
    });

    if (!user) {
      throw new NotFoundException(`User ${currentUserId} not found`);
    }

    return this.carsService.createByUser(dto, user);
  }

  async updateCar(id: number, dto: UpdateCarByUserDto, currentUserId: number) {
    const user = await this.userRepository.findOne({
      where: { id: currentUserId },
    });

    if (!user) {
      throw new NotFoundException(`User ${currentUserId} not found`);
    }

    return this.carsService.updateByUser(id, dto, user);
  }

  async removeCar(dto: DeleteCarDto, currentUserId: number) {
    const user = await this.userRepository.findOne({
      where: { id: currentUserId },
    });

    if (!user) {
      throw new NotFoundException(`User ${currentUserId} not found`);
    }

    return this.carsService.remove(dto);
  }

  async moveToBinCar(dto: MoveCarToBinDto, currentUserId: number) {
    const user = await this.userRepository.findOne({
      where: { id: currentUserId },
    });

    if (!user) {
      throw new NotFoundException(`User ${currentUserId} not found`);
    }

    return this.carsService.moveToBin(dto, user);
  }

  async findAllCars(id: number, query: QueryCarByUserDto) {
    const user = await this.userRepository.findOne({
      where: { id: id },
    });

    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }

    return this.carsService.findAllByUser(user, query);
  }

  async uploadAttachment(
    file: Express.Multer.File,
    dto: UploadUserAttachmentDto,
  ) {
    const { attachmentType } = dto;

    const { location, error } = await this.s3FileService.fileUpload(
      file,
      `attachments/${attachmentType}`,
    );

    if (error) {
      return error;
    }

    return this.attachmentRepository.create({
      filename: filenameBuffer(file.originalname),
      extension: extname(file.originalname).slice(1),
      size: file.size,
      url: location,
      attachmentType: attachmentType,
    });
  }

  async findByToken(dto: FindByTokenDto) {
    const { verifiedToken, inviteToken, resetPasswordToken } = dto;
    let user: User;

    if (verifiedToken) {
      user = await this.userRepository.findOne({
        where: { verifiedToken },
        relations: { attachments: true },
      });
    }

    if (inviteToken) {
      user = await this.userRepository.findOne({
        where: {
          inviteToken,
          inviteTokenExpiredAt: MoreThan(new Date()),
        },
        relations: { attachments: true },
      });
    }

    if (resetPasswordToken) {
      user = await this.userRepository.findOne({
        where: {
          resetPasswordToken,
          resetPasswordExpiredAt: MoreThan(new Date()),
        },
      });
    }

    if (!user) {
      throw new NotFoundException(`User not found or Invalid token.`);
    }

    return user;
  }

  async findAllUserSaveCars(query: QuerySaveCarDto, currentUserId: number) {
    return this.carsService.findAllSaveCarByUser(query, currentUserId);
  }

  async findOneUserSaveCar(id: number, currentUserId: number) {
    return this.carsService.findOneSaveCarByUser(id, currentUserId);
  }

  async createSaveCar(
    createSaveCarDto: CreateSaveCarDto,
    currentUserId: number,
  ) {
    return this.saveCarsService.create(createSaveCarDto, currentUserId);
  }

  async removeSaveCar(
    currentUserId: number,
    removeSaveCarDto: RemoveSaveCarDto,
  ) {
    return this.saveCarsService.remove(removeSaveCarDto, currentUserId);
  }

  async updateUserDataToFirebase(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
      select: [
        'id',
        'uid',
        'profileImageUrl',
        'firstName',
        'lastName',
        'phoneNumber',
      ],
    });
    await this.chatProducer.queueUpUpdateUserJob({
      name: `${user.firstName} ${user.lastName}`,
      profileImage: user.profileImageUrl,
      id: user.uid,
      phoneNumber: user.phoneNumber,
    });
  }

  async resendVerifyUser(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
    });
    const verifyToken = crypto.randomBytes(28).toString('hex');

    if (user) {
      const fullName = `${user.firstName} ${user.lastName}`;
      user.verifiedToken = verifyToken;
      await this.emailService.sendUserVerifyToken(
        user.email,
        verifyToken,
        fullName,
      );
      await this.userRepository.save(user);
    }
    return { message: 'Success' };
  }

  async findAllVouchers(id: number, query: QueryVoucherByUserDto) {
    const user = await this.userRepository.findOne({
      where: { id: id },
    });

    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }

    return this.voucherService.findAllByUser(id, query);
  }

  async createAccountWithSocial(
    dto: CreateUserSocialDto,
    userProvider: ISocialProfile,
    image: Express.Multer.File,
  ) {
    await this.validateEmailAndTaxId({ email: dto.email, taxId: dto.taxId });

    const existsUser = await this.userRepository.findOne({
      where: { email: dto.email },
    });

    if (existsUser)
      throw new BadRequestException(`Email ${dto.email} already used.`);

    const { uid, firstName, lastName, email, pictureUrl, providerType } =
      userProvider;

    const user = this.userRepository.create({
      ...dto,
      firstAuthProvider: providerType,
      authenticationProviders: [
        {
          uid,
          firstName,
          lastName,
          email,
          pictureUrl,
          providerType,
        },
      ],
    });

    if (user.role == UserRole.PRIVATE) {
      user.status = UserStatus.VERIFIED;
      user.verifiedAt = new Date();
      user.postLimit = 2;
    }

    if (user.role == UserRole.DEALER) {
      user.status = UserStatus.WAITING_APPROVE;
    }

    if (!user.stripeId) {
      user.stripeId = await this.stripeService.createCustomer(
        `${dto.firstName} ${dto.lastName}`,
        user.email,
        { role: user.role },
      );
    }

    if (image) {
      const uploadedFile = await this.s3FileService.fileUpload(
        image,
        'images/users',
      );

      if (uploadedFile.location) {
        user.profileImageUrl = uploadedFile.location;
      }
    }

    return await this.userRepository.save(user);
  }

  async markAllAsReadNotifications(currentUserId: number) {
    const user = await this.userRepository.findOne({
      where: { id: currentUserId },
    });

    if (!user) {
      throw new NotFoundException(`User ${currentUserId} not found`);
    }

    return this.notificationsService.markAllAsRead(currentUserId);
  }

  async setReadNotification(id: string, currentUserId: number) {
    const user = await this.userRepository.findOne({
      where: { id: currentUserId },
    });

    if (!user) {
      throw new NotFoundException(`User ${currentUserId} not found`);
    }

    await this.notificationsService.setRead(id, currentUserId);
  }

  private async validateEmailAndTaxId(dto: { email?: string; taxId?: string }) {
    const { email, taxId } = dto;

    const findUserWithEmail = await this.userRepository.findOne({
      where: { email: email },
    });

    if (taxId) {
      const findUserWithTaxId = await this.userRepository.findOne({
        where: { taxId: taxId },
      });
      if (findUserWithEmail && findUserWithTaxId) {
        throw new BadRequestException(`Tax ID and email are already used.`);
      }

      if (findUserWithTaxId) {
        throw new BadRequestException(`Tax Id ${taxId} is already used.`);
      }
    }

    if (findUserWithEmail) {
      throw new BadRequestException(`Email ${email} is already used.`);
    }
  }
}
