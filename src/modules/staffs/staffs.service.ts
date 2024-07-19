import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import * as crypto from 'crypto';
import * as argon from 'argon2';
import * as XLSX from 'xlsx-js-style';

import { StaffRole, StaffStatus } from '@/common/enums/staff.eum';
import { Staff } from '@/db/entities/staff.entity';
import { UserRejectionLog } from '../../db/entities/user-rejection-log.entity';
import { S3FileService } from '@/services/s3-file.service';
import { InviteStaffDto, ResendInviteStaffDto } from './dto/invite-staff.dto';
import { SetupStaffDto } from './dto/setup-staff-account.dto';
import { CarsService } from '../cars/cars.service';
import { RejectCarDto } from '../cars/dto/reject-car.dto';
import { QueryStaffDto } from './dto/query-user.dto';
import { PaginationsService } from '../paginations/paginations.service';
import { StaffChangePasswordDto } from './dto/change-password.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import {
  UserReviewStatus,
  UserRole,
  UserStatus,
} from '@/common/enums/user.enum';
import { User } from '@/db/entities/user.entity';
import { ReviewUserDto } from './dto/review-user.dto';
import { UpdateCarByStaffDto } from '../cars/dto/update-car-by-staff.dto';
import { QueryCarByStaffDto } from '../cars/dto/query-car-by-staff.dto';
import { FindByTokenDto } from './dto/find-by-token.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { EmailService } from '../email/email.service';
import { VouchersService } from '../vouchers/vouchers.service';
import { QueryVoucherByStaffDto } from '../vouchers/dto/query-voucher-by-staff.dto';
import { UpdateVoucherDto } from '../vouchers/dto/update-voucher.dto';
import { MoveCarToBinDto } from '../cars/dto/move-car-to-bin.dto';
import { UpdateUserByStaffDto } from '../users/dto/update-user-by-staff.dto';
import { UsersService } from '../users/users.service';
import { DeleteStaffDto } from './dto/delete-staffs.dto';
import { DeleteUserDto } from './dto/delete-users.dto';
import { InviteUserDto, ResendInviteDto } from './dto/invite-user.dto';
import { AuthService } from '../auth/auth.service';
import { CreateCarByStaffDto } from '../cars/dto/create-car-by-staff.dto';
import { AddProductBalanceDto } from './dto/add-product-balance.dto';
import { ProductPriceType } from '@/common/enums/product-price.enum';
import { StaffNotificationsService } from '../notifications/staff-notification.service';
import { UpdateRoleStaffDto } from './dto/update-role-staff.dto';

@Injectable()
export class StaffsService {
  constructor(
    private readonly s3FileService: S3FileService,
    private readonly paginationsService: PaginationsService,
    private readonly carsService: CarsService,
    private readonly voucherService: VouchersService,
    private readonly emailService: EmailService,
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
    private readonly staffNotificationsService: StaffNotificationsService,

    @InjectRepository(Staff)
    private readonly staffRepository: Repository<Staff>,

    @InjectRepository(UserRejectionLog)
    private readonly userRejectionLogRepository: Repository<UserRejectionLog>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async inviteStaff(dto: InviteStaffDto, currentStaffId: number) {
    let inviteToken = null;
    const findInvitedStaff = await this.staffRepository.findOne({
      where: { id: currentStaffId },
    });
    if (!findInvitedStaff) {
      throw new NotFoundException(`Staff ${currentStaffId} not found`);
    }
    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() + 7);
    for (const staff of dto.staffs) {
      const findStaff = await this.staffRepository.findOne({
        where: { email: staff.email },
        withDeleted: true,
      });
      inviteToken = crypto.randomBytes(28).toString('hex');
      if (!findStaff) {
        const createUser = this.staffRepository.create({
          email: staff.email,
          role: staff.role,
          status: StaffStatus.INVITED,
          inviteToken: inviteToken,
          invitedBy: findInvitedStaff,
          inviteTokenExpiredAt: currentDate,
        });
        await this.staffRepository.save(createUser);
        await this.emailService.sendInviteStaff(staff.email, inviteToken);
      } else if (findStaff.deletedAt) {
        findStaff.status = StaffStatus.INVITED;
        findStaff.inviteToken = inviteToken;
        findStaff.invitedBy = findInvitedStaff;
        findStaff.inviteTokenExpiredAt = currentDate;
        findStaff.deletedAt = null;
        await this.staffRepository.save(findStaff);
        await this.emailService.sendInviteStaff(staff.email, inviteToken);
      } else {
        throw new BadRequestException(`Duplicated staff  #${staff.email}`);
      }
    }
    return { message: 'Success' };
  }

  async setupStaffAccount(dto: SetupStaffDto, image: Express.Multer.File) {
    const { password, firstName, lastName, phoneNumber, inviteToken } = dto;

    const findStaff = await this.staffRepository.findOne({
      where: { inviteToken, inviteTokenExpiredAt: MoreThan(new Date()) },
    });

    if (!findStaff) {
      throw new NotFoundException('Account not found');
    }

    const staff = await this.staffRepository.preload({
      id: findStaff.id,
      firstName,
      lastName,
      phoneNumber,
    });

    staff.password = await this.encryptPassword(password);
    staff.verifiedAt = new Date();
    staff.verifiedToken = null;
    staff.status = StaffStatus.VERIFIED;
    staff.inviteToken = null;
    staff.inviteTokenExpiredAt = null;

    if (image) {
      const uploadedFile = await this.s3FileService.fileUpload(
        image,
        'images/users',
      );

      if (uploadedFile.location) {
        staff.profileImageUrl = uploadedFile.location;
      }
    }

    const tokens = await this.authService.generateTokens(staff);
    await this.authService.hashAndUpdateStaffRefreshToken(
      staff,
      tokens.refreshToken,
    );
    return tokens;
  }

  async resendInvite(dto: ResendInviteStaffDto) {
    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() + 7);
    for (const id of dto.ids) {
      const findStaff = await this.staffRepository.findOne({
        where: { id, status: StaffStatus.INVITED },
      });

      if (findStaff) {
        findStaff.inviteTokenExpiredAt = currentDate;
        findStaff.inviteToken = crypto.randomBytes(28).toString('hex');
        await this.staffRepository.save(findStaff);
        await this.emailService.sendInviteStaff(
          findStaff.email,
          findStaff.inviteToken,
        );
      }
    }

    return { message: 'Success' };
  }

  async createCar(dto: CreateCarByStaffDto, currentStaffId: number) {
    const staff = await this.staffRepository.findOne({
      where: { id: currentStaffId },
    });

    if (!staff) {
      throw new NotFoundException(`Staff ${currentStaffId} not found`);
    }

    return this.carsService.createByStaff(dto, staff);
  }

  async updateCar(
    id: number,
    dto: UpdateCarByStaffDto,
    currentStaffId: number,
  ) {
    const staff = await this.staffRepository.findOne({
      where: { id: currentStaffId },
    });

    if (!staff) {
      throw new NotFoundException(`Staff ${currentStaffId} not found`);
    }

    return this.carsService.updateByStaff(id, dto, staff);
  }

  async moveToBinCar(dto: MoveCarToBinDto, currentStaffId: number) {
    const staff = await this.staffRepository.findOne({
      where: { id: currentStaffId },
    });

    if (!staff) {
      throw new NotFoundException(`Staff ${currentStaffId} not found`);
    }

    return this.carsService.moveToBin(dto, staff);
  }

  async findAllCars(query: QueryCarByStaffDto, currentStaffId: number) {
    const staff = await this.staffRepository.findOne({
      where: { id: currentStaffId },
    });

    if (!staff) {
      throw new NotFoundException(`Staff ${currentStaffId} not found`);
    }

    return this.carsService.findAllByStaff(staff, query);
  }

  async publishCar(id: number, currentStaffId: number) {
    const staff = await this.staffRepository.findOne({
      where: { id: currentStaffId },
    });

    if (!staff) {
      throw new NotFoundException(`Staff ${currentStaffId} not found`);
    }

    return this.carsService.publish(id, staff);
  }

  async rejectCar(id: number, dto: RejectCarDto, currentStaffId: number) {
    const staff = await this.staffRepository.findOne({
      where: { id: currentStaffId },
    });

    if (!staff) {
      throw new NotFoundException(`Staff ${currentStaffId} not found`);
    }

    return this.carsService.reject(id, dto, staff);
  }

  async findAllVouchers(query: QueryVoucherByStaffDto, currentStaffId: number) {
    const staff = await this.staffRepository.findOne({
      where: { id: currentStaffId },
    });

    if (!staff) {
      throw new NotFoundException(`Staff ${currentStaffId} not found`);
    }

    return this.voucherService.findAllByStaff(query);
  }

  async updateVoucher(
    id: number,
    dto: UpdateVoucherDto,
    currentStaffId: number,
  ) {
    const staff = await this.staffRepository.findOne({
      where: { id: currentStaffId },
    });

    if (!staff) {
      throw new NotFoundException(`Staff ${currentStaffId} not found`);
    }

    return this.voucherService.updateByStaff(id, dto);
  }

  private async encryptPassword(password: string) {
    return await argon.hash(password);
  }

  async findOne(id: number) {
    const staff = await this.staffRepository.findOne({
      where: { id },
    });

    if (!staff) {
      throw new NotFoundException('Staff not found');
    }

    return staff;
  }

  async findAll(query: QueryStaffDto) {
    const {
      limitPerPage,
      page,
      all,
      search,
      sortDirection,
      sortBy,
      status,
      role,
    } = query;

    const staffQuery = this.staffRepository.createQueryBuilder('staff');

    if (search) {
      staffQuery.andWhere(
        `(staff.email ILIKE :search OR
          staff.firstName ILIKE :search OR
          staff.lastName ILIKE :search OR
          CONCAT_WS(' ', staff.firstName, staff.lastName) ILIKE :search)`,
        {
          search: `%${search}%`,
        },
      );
    }
    staffQuery.andWhere('staff.status IN (:...status)', { status });

    if (role) {
      staffQuery.andWhere(`staff.role = :role`, { role });
    }
    if (sortBy === 'fullName') {
      staffQuery.orderBy(
        `"staff"."first_name"`,
        sortDirection as 'ASC' | 'DESC',
      );
      staffQuery.addOrderBy(
        `"staff"."last_name"`,
        sortDirection as 'ASC' | 'DESC',
      );
    } else staffQuery.orderBy(`${sortBy}`, sortDirection as 'ASC' | 'DESC');

    return await this.paginationsService.paginate(staffQuery, {
      limitPerPage,
      all,
      page,
    });
  }

  async changePassword(id: number, dto: StaffChangePasswordDto) {
    const staff = await this.staffRepository
      .createQueryBuilder()
      .select('*')
      .where('id = :id', { id })
      .getRawOne();
    if (!staff) {
      throw new NotFoundException('Staff not found');
    }

    if (!(await argon.verify(staff.password, dto.password)))
      throw new BadRequestException(
        'Current password is invalid. Please check and try again.',
      );

    if (dto.newPassword !== dto.confirmNewPassword)
      throw new BadRequestException(
        'New password does not match. Please check and try again.',
      );

    staff.password = await this.encryptPassword(dto.newPassword);
    return await this.staffRepository.save(staff);
  }

  async remove(id: number, currentStaffId: number) {
    const staff = await this.staffRepository.findOne({
      where: { id: currentStaffId },
    });
    if (!staff)
      throw new NotFoundException(`Staff #${currentStaffId} not found`);
    return await this.staffRepository.softDelete(id);
  }

  async update(id: number, image: Express.Multer.File, dto: UpdateStaffDto) {
    const { firstName, lastName, phoneNumber, deleteImage } = dto;
    const staff = await this.staffRepository.preload({
      id,
      firstName,
      lastName,
      phoneNumber,
    });

    if (!staff) {
      throw new NotFoundException(`staff ${id} not found`);
    }
    if (image) {
      if (staff.profileImageUrl) {
        const filename = staff.profileImageUrl.split('/').pop();
        await this.s3FileService.removeFile(filename, 'users');
      }
      const uploadedFile = await this.s3FileService.fileUpload(image, 'users');

      if (uploadedFile.location) {
        staff.profileImageUrl = uploadedFile.location;
      }
    } else if (deleteImage) {
      if (staff.profileImageUrl) {
        const filename = staff.profileImageUrl.split('/').pop();
        await this.s3FileService.removeFile(filename, 'users');
      }
      staff.profileImageUrl = null;
    }
    return await this.staffRepository.save(staff);
  }

  async forgetPassword(email: string) {
    const staff = await this.staffRepository.findOne({
      where: { email },
    });

    if (!staff) {
      throw new NotFoundException(`Staff ${email} not found`);
    }

    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() + 7);

    staff.resetPasswordToken = crypto.randomBytes(28).toString('hex');
    staff.resetPasswordExpiredAt = currentDate;

    await this.staffRepository.save(staff);

    const fullName = `${staff.firstName} ${staff.lastName}`;
    const isSendToStaff = true;

    await this.emailService.sendForgotPassword(
      email,
      staff.resetPasswordToken,
      fullName,
      isSendToStaff,
    );
    return { message: 'An email has been sent to your email address' };
  }

  async reviewUser(dto: ReviewUserDto, currentStaffId: number) {
    const { status, userId, rejectReason, postLimit } = dto;
    const staff = await this.staffRepository.findOne({
      where: { id: currentStaffId },
    });

    if (!staff) {
      throw new NotFoundException(`Staff ${currentStaffId} not found`);
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException(`User ${userId} not found`);
    }

    if (user.role !== UserRole.DEALER) {
      throw new BadRequestException(`User ${userId} is not dealer`);
    }

    if (status === UserReviewStatus.APPROVED) {
      user.approvedBy = staff;
      user.status = UserStatus.VERIFIED;
      user.verifiedAt = new Date();
      await this.emailService.sendApprovedDealerEmail(
        user.email,
        user.dealerName,
      );
    } else {
      user.status = UserStatus.REJECTED;
      const createUserRejectLog = this.userRejectionLogRepository.create({
        rejectedBy: staff,
        reason: rejectReason,
        user: user,
      });
      await this.userRejectionLogRepository.save(createUserRejectLog);
      await this.emailService.sendRejectedDealerEmail(
        user.email,
        user.dealerName,
      );
    }

    user.postLimit = postLimit;
    await this.userRepository.save(user);
    return { message: 'Success' };
  }

  async updateUser(
    id: number,
    dto: UpdateUserByStaffDto,
    image: Express.Multer.File,
    currentStaffId: number,
  ) {
    const staff = await this.staffRepository.findOne({
      where: { id: currentStaffId },
    });

    if (!staff) {
      throw new NotFoundException(`Staff ${currentStaffId} not found`);
    }

    return await this.usersService.updateByStaff(id, dto, image);
  }

  async findByToken(dto: FindByTokenDto) {
    const { verifiedToken, inviteToken, resetPasswordToken } = dto;
    let staff: Staff;
    if (verifiedToken) {
      staff = await this.staffRepository.findOne({ where: { verifiedToken } });
    }
    if (inviteToken) {
      staff = await this.staffRepository.findOne({ where: { inviteToken } });
    }
    if (resetPasswordToken) {
      staff = await this.staffRepository.findOne({
        where: {
          resetPasswordToken,
          resetPasswordExpiredAt: MoreThan(new Date()),
        },
      });
    }
    if (!staff) {
      throw new NotFoundException(`Staff not found or Invalid token.`);
    }
    return staff;
  }

  async resetPassword(dto: ResetPasswordDto) {
    const { resetPasswordToken, password } = dto;
    const staff = await this.staffRepository.findOne({
      where: { resetPasswordToken },
    });

    if (!staff) throw new NotFoundException('Staff not found');

    staff.password = await this.encryptPassword(password);
    staff.resetPasswordToken = null;
    staff.resetPasswordExpiredAt = null;

    return await this.staffRepository.save(staff);
  }

  async getProfile(currentStaffId?: number) {
    return await this.staffRepository.findOne({
      where: { id: currentStaffId },
    });
  }

  async reactiveDealer(id: number, currentStaffId: number) {
    const staff = await this.staffRepository.findOne({
      where: { id: currentStaffId },
    });
    if (!staff) {
      throw new NotFoundException(`Staff not found`);
    }

    const user = await this.userRepository.findOne({
      where: { id, role: UserRole.DEALER },
    });

    if (!user) throw new NotFoundException('Dealer user not found');
    if (user.status !== UserStatus.INACTIVE)
      throw new BadRequestException('User is not inactive status');

    user.status = UserStatus.VERIFIED;
    return await this.userRepository.save(user);
  }

  async removeStaffs(dto: DeleteStaffDto, currentStaffId: number) {
    const staff = await this.staffRepository.findOne({
      where: { id: currentStaffId },
    });
    if (!staff)
      throw new NotFoundException(`Staff #${currentStaffId} not found`);
    return await this.staffRepository.softDelete(dto.ids);
  }

  async removeUser(id: number, currentStaffId: number) {
    const staff = await this.staffRepository.findOne({
      where: { id: currentStaffId },
    });
    if (!staff)
      throw new NotFoundException(`Staff #${currentStaffId} not found`);
    return await this.userRepository.softDelete(id);
  }

  async removeUsers(dto: DeleteUserDto, currentStaffId: number) {
    const staff = await this.staffRepository.findOne({
      where: { id: currentStaffId },
    });
    if (!staff)
      throw new NotFoundException(`Staff #${currentStaffId} not found`);
    return await this.userRepository.softDelete(dto.ids);
  }

  async inviteUsers(dto: InviteUserDto, currentStaffId: number) {
    const staff = await this.staffRepository.findOne({
      where: { id: currentStaffId },
    });
    if (!staff)
      throw new NotFoundException(`Staff #${currentStaffId} not found`);
    let inviteToken = null;
    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() + 7);
    for (const user of dto.users) {
      inviteToken = crypto.randomBytes(28).toString('hex');
      const findUser = await this.userRepository.findOne({
        where: { email: user.email },
        withDeleted: true,
      });
      if (!findUser) {
        const createUser = this.userRepository.create({
          email: user.email,
          role: user.role,
          status: UserStatus.INVITED,
          inviteToken: inviteToken,
          inviteTokenExpiredAt: currentDate,
        });
        await this.userRepository.save(createUser);
        await this.emailService.sendInviteUser(
          user.email,
          user.email,
          createUser.inviteToken,
        );
      } else if (findUser.deletedAt) {
        findUser.status = UserStatus.INVITED;
        findUser.inviteToken = inviteToken;
        findUser.inviteTokenExpiredAt = currentDate;
        findUser.deletedAt = null;
        await this.userRepository.save(findUser);
        const fullName = `${findUser.firstName} ${findUser.lastName}`;
        await this.emailService.sendInviteUser(
          user.email,
          fullName,
          findUser.inviteToken,
        );
      } else {
        throw new BadRequestException(`Duplicated user #${user.email}`);
      }
    }
    return { message: 'Success' };
  }

  async resendInviteUsers(dto: ResendInviteDto, currentStaffId: number) {
    const staff = await this.staffRepository.findOne({
      where: { id: currentStaffId },
    });
    if (!staff)
      throw new NotFoundException(`Staff #${currentStaffId} not found`);
    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() + 7);
    for (const id of dto.ids) {
      const findUser = await this.userRepository.findOne({
        where: { id },
      });
      if (findUser) {
        findUser.inviteTokenExpiredAt = currentDate;
        findUser.inviteToken = crypto.randomBytes(28).toString('hex');
        await this.userRepository.save(findUser);
        await this.emailService.sendInviteUser(
          findUser.email,
          findUser.email,
          findUser.inviteToken,
        );
      }
    }
    return { message: 'Success' };
  }

  async resendVerifyUser(id: number, currentStaffId: number) {
    const staff = await this.staffRepository.findOne({
      where: { id: currentStaffId },
    });
    if (!staff)
      throw new NotFoundException(`Staff #${currentStaffId} not found`);
    const findUser = await this.userRepository.findOne({
      where: { id },
    });
    const verifyToken = crypto.randomBytes(28).toString('hex');

    if (findUser) {
      const fullName = `${findUser.firstName} ${findUser.lastName}`;
      findUser.verifiedToken = verifyToken;
      await this.emailService.sendUserVerifyToken(
        findUser.email,
        verifyToken,
        fullName,
      );
      await this.userRepository.save(findUser);
    }
    return { message: 'Success' };
  }

  async deactivateUser(id: number, currentStaffId: number) {
    const staff = await this.staffRepository.findOne({
      where: { id: currentStaffId },
    });
    if (!staff)
      throw new NotFoundException(`Staff #${currentStaffId} not found`);
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User #${id} not found`);
    if (![UserStatus.VERIFIED, UserStatus.REJECTED].includes(user.status))
      throw new NotFoundException(
        `can not update inactive status to user #${id}`,
      );
    user.status = UserStatus.INACTIVE;
    return await this.userRepository.save(user);
  }

  exportInviteTemplate() {
    const headers = ['Email', 'UserType'];

    const workbook = XLSX.utils.book_new();
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet([]);
    XLSX.utils.sheet_add_aoa(worksheet, [headers]);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

    return XLSX.write(workbook, {
      bookType: 'xlsx',
      bookSST: false,
      type: 'base64',
    });
  }

  async validateInviteTemplate(data) {
    const emailRegex =
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    const userType = ['dealer', 'private'];
    const userList = [];
    for (const user of data) {
      if (
        !userType.includes(user['UserType'].toLowerCase()) ||
        !emailRegex.test(user['Email'])
      ) {
        throw new BadRequestException(
          `Error text "Incorrect file data. Please recheck and try again.`,
        );
      }
      userList.push({
        email: user['Email'],
        userType: user['UserType'].toLowerCase(),
      });
    }
    return userList;
  }

  async ImportInviteTemplate(
    file: Express.Multer.File,
    currentStaffId: number,
  ) {
    const staff = await this.staffRepository.findOne({
      where: { id: currentStaffId },
    });
    if (!staff)
      throw new NotFoundException(`Staff #${currentStaffId} not found`);
    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    const users = await this.validateInviteTemplate(data);
    const inviteUsers = [];
    for (const user of users) {
      const findUser = await this.userRepository.findOne({
        where: { email: user['email'] },
      });
      if (!findUser) {
        const currentDate = new Date();
        currentDate.setDate(currentDate.getDate() + 7);
        const inviteToken = crypto.randomBytes(28).toString('hex');
        const createUser = this.userRepository.create({
          email: user['email'],
          role: user['userType'],
          status: UserStatus.INVITED,
          inviteToken: inviteToken,
          inviteTokenExpiredAt: currentDate,
        });
        await this.userRepository.save(createUser);
        await this.emailService.sendInviteUser(
          user.email,
          user.email,
          createUser.inviteToken,
        );
        inviteUsers.push({ user: user['email'] });
      }
    }
    return inviteUsers;
  }

  async AddProductBalance(
    id: number,
    dto: AddProductBalanceDto,
    currentStaffId: number,
  ) {
    const staff = await this.staffRepository.findOne({
      where: { id: currentStaffId },
    });
    if (!staff)
      throw new NotFoundException(`Staff #${currentStaffId} not found`);
    const { amount, productType } = dto;
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) throw new NotFoundException(`User #${id} not found`);

    if (productType === ProductPriceType.CARSMEUP_CERTIFIED)
      user.carsmeupCertifiedBalance += amount;
    if (productType === ProductPriceType.BUMP) user.bumpBalance += amount;
    if (productType === ProductPriceType.HOT_DEAL)
      user.hotDealBalance += amount;

    return await this.userRepository.save(user);
  }

  async setReadNotification(id: string, currentStaffId: number) {
    const staff = await this.staffRepository.findOne({
      where: { id: currentStaffId },
    });
    if (!staff)
      throw new NotFoundException(`Staff #${currentStaffId} not found`);

    return this.staffNotificationsService.setRead(id);
  }

  async markAllAsReadNotification(currentStaffId: number) {
    const staff = await this.staffRepository.findOne({
      where: { id: currentStaffId },
    });
    if (!staff)
      throw new NotFoundException(`Staff #${currentStaffId} not found`);

    return this.staffNotificationsService.markAllAsRead();
  }

  async changeRole(
    id: number,
    currentStaffId: number,
    dto: UpdateRoleStaffDto,
  ) {
    const mainStaff = await this.staffRepository.findOne({
      where: { id: currentStaffId },
    });
    if (!mainStaff)
      throw new NotFoundException(`Main staff #${currentStaffId} not found`);

    const staff = await this.staffRepository.findOne({
      where: { id: id },
    });

    if (!staff) throw new NotFoundException(`Staff #${id} not found`);

    return await this.staffRepository.save({ id, role: dto.role });
  }
}
