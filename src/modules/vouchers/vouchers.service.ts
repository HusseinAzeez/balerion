import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { ApiTags } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, DataSource, Not, Repository } from 'typeorm';

import { VoucherStatus, VoucherType } from '@/common/enums/voucher.enum';
import { User } from '@/db/entities/user.entity';
import { Voucher } from '@/db/entities/voucher.entity';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { EmailService } from '../email/email.service';
import {
  IProviderVoucher,
  IUserVoucher,
  IProviderVoucherPayload,
  IUserVoucherPayload,
} from '../email/email.interface';
import { DateTime } from 'luxon';
import { PaginationsService } from '../paginations/paginations.service';
import { isEmpty, isEqual } from 'lodash';
import { AttachmentTypeVoucherDetail } from '@/common/enums/attachment.enum';
import { UpdateVoucherDto } from './dto/update-voucher.dto';
import { QueryVoucherByUserDto } from './dto/query-voucher-by-user.dto';
import { QueryVoucherByStaffDto } from './dto/query-voucher-by-staff.dto';
import { Attachment } from '@/db/entities/attachment.entity';
import { filenameBuffer } from '@/common/helpers/multer.helper';
import { S3FileService } from '@/services';
import { UploadVoucherAttachmentDto } from './dto/upload-voucher-attachment.dto';
import { extname } from 'path';

@ApiTags('Vouchers')
@Injectable()
export class VouchersService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
    private readonly paginationsService: PaginationsService,
    private readonly s3FileService: S3FileService,

    @InjectRepository(Voucher)
    private readonly voucherRepository: Repository<Voucher>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Attachment)
    private readonly attachmentRepository: Repository<Attachment>,
  ) {}

  async findAllByStaff(query: QueryVoucherByStaffDto) {
    const {
      voucherType,
      limitPerPage,
      all,
      page,
      search,
      sortDirection,
      sortBy,
      status,
      startDate,
      endDate,
    } = query;
    const voucherQuery = this.voucherRepository
      .createQueryBuilder('voucher')
      .leftJoinAndSelect('voucher.voucherDetail', 'voucherDetail')
      .leftJoinAndSelect('voucher.cmuCertifiedRequest', 'cmuCertifiedRequest')
      .where('voucher.voucherType = :voucherType', { voucherType });

    if (search)
      voucherQuery.andWhere(
        new Brackets((qb) => {
          qb.where('voucher.uid ILIKE :search');
          qb.orWhere('voucherDetail.carPlateNumber ILIKE :search');
          qb.orWhere('voucherDetail.carInformation ILIKE :search');
          qb.orWhere('voucherDetail.ownerFullName ILIKE :search');
        }),
        { search: `%${search}%` },
      );
    if (status)
      voucherQuery.andWhere('voucher.status IN (:...status)', { status });

    if (startDate && endDate) {
      voucherQuery.andWhere(
        'voucher.activatedAt between :startDate and :endDate',
        { startDate, endDate },
      );
    }

    if (sortBy && sortDirection) {
      voucherQuery.orderBy(sortBy, sortDirection);
    }
    const result = await this.paginationsService.paginate(voucherQuery, {
      limitPerPage,
      all,
      page,
    });
    return result;
  }

  async findAllByUser(userId: number, query: QueryVoucherByUserDto) {
    const { voucherType, status, sortDirection, sortBy } = query;

    const voucherQuery = this.voucherRepository
      .createQueryBuilder('voucher')
      .leftJoinAndSelect('voucher.voucherDetail', 'voucherDetail')
      .leftJoinAndSelect('voucher.cmuCertifiedRequest', 'cmuCertifiedRequest')
      .where('voucher.user_id = :userId', { userId });

    if (!isEmpty(voucherType)) {
      voucherQuery.andWhere('voucher.voucherType IN (:...voucherType)', {
        voucherType,
      });
    }

    if (!isEmpty(status)) {
      voucherQuery.andWhere('voucher.status IN (:...status)', { status });
    }

    voucherQuery.orderBy(`${sortBy}`, sortDirection, 'NULLS LAST');

    return voucherQuery.getMany();
  }

  async updateByStaff(id: number, dto: UpdateVoucherDto) {
    const voucher = await this.voucherRepository.findOne({
      where: { id },
      relations: { voucherDetail: true },
    });

    if (!voucher) {
      throw new NotFoundException(`Voucher ${id} not found`);
    }

    await this.checkCarAlreadyActivatedVoucher(
      voucher.voucherType,
      dto.carPlateNumber,
      voucher.userId,
      id,
    );

    if (voucher.voucherType === VoucherType.ROADSIDE_ASSIST) {
      if (!dto.ownerPhoneNumber)
        throw new BadRequestException([
          'ownerPhoneNumber should not be empty',
          'ownerPhoneNumber must be string',
        ]);
      const fileTypes = dto.attachments
        ?.map((value) => value.attachmentType)
        .sort();
      const expectedFileTypes = Object.values(AttachmentTypeVoucherDetail);

      if (!isEqual(expectedFileTypes, fileTypes))
        throw new BadRequestException(
          `attachments must have be ${AttachmentTypeVoucherDetail.EXTERIOR}, ${AttachmentTypeVoucherDetail.INTERIOR} and ${AttachmentTypeVoucherDetail.REGISTRATION_CARD}`,
        );
    }

    voucher.voucherDetail = {
      ...voucher.voucherDetail,
      ...dto,
      carInformation: dto.carBrand.concat(', ', dto.carModel),
      ownerFullName: dto.ownerFirstName.concat(' ', dto.ownerLastName),
    };

    await this.sendProviderVoucherEmail({
      voucher: {
        uid: voucher.uid,
        voucherType: voucher.voucherType,
        activatedAt: voucher.activatedAt,
      },
      car: {
        brand: dto.carBrand,
        model: dto.carModel,
        plateNumber: dto.carPlateNumber,
      },
      client: {
        firstName: dto.ownerFirstName,
        lastName: dto.ownerLastName,
        phoneNumber: dto.ownerPhoneNumber,
      },
    });

    await this.sendUserVoucherEmail({
      voucherId: voucher.id,
      uid: voucher.uid,
      isCMUVoucher: voucher.voucherType == VoucherType.CARSMEUP_CERTIFIED,
      client: {
        email: voucher.voucherDetail.ownerEmail,
        firstName: dto.ownerFirstName,
        lastName: dto.ownerLastName,
      },
    });

    return await this.voucherRepository.save(voucher);
  }

  async create(dto: CreateVoucherDto, currentUserId: number) {
    const user = await this.userRepository.findOne({
      where: { id: currentUserId },
    });

    if (!user) {
      throw new NotFoundException(`User id #${currentUserId} not found`);
    }

    const { voucherType, carPlateNumber } = dto;

    if (voucherType === VoucherType.ROADSIDE_ASSIST) {
      if (user.roadsideAssistBalance <= 0) {
        throw new BadRequestException('Insufficient balance');
      }

      await this.checkCarAlreadyActivatedVoucher(
        voucherType,
        carPlateNumber,
        currentUserId,
      );
      return await this.activateVoucher(dto, user);
    } else if (voucherType === VoucherType.B_QUIK_BENZINE) {
      if (user.bquikBenzineBalance <= 0) {
        throw new BadRequestException('Insufficient balance');
      }
      return await this.activateVoucher(dto, user);
    } else if (voucherType === VoucherType.B_QUIK_DIESEL) {
      if (user.bquikDieselBalance <= 0) {
        throw new BadRequestException('Insufficient balance');
      }

      return await this.activateVoucher(dto, user);
    }
  }

  async findOne(id: number) {
    return await this.voucherRepository.findOne({
      where: { id },
      relations: {
        user: true,
        cmuCertifiedRequest: true,
        voucherDetail: {
          attachments: true,
        },
      },
    });
  }

  async redeem(id: number) {
    const voucher = await this.voucherRepository.findOne({
      where: { id },
    });

    if (!voucher) {
      throw new NotFoundException(`Voucher ${id} not found`);
    }

    if (voucher.status !== VoucherStatus.ACTIVATED) {
      throw new BadRequestException(
        `Voucher status is not ready to be redeemed`,
      );
    }

    if (
      voucher.voucherType !== VoucherType.B_QUIK_DIESEL &&
      voucher.voucherType !== VoucherType.B_QUIK_BENZINE
    ) {
      throw new BadRequestException(`Voucher type is not redeemable`);
    }

    voucher.redeemedAt = new Date();

    return await this.voucherRepository.save(voucher);
  }

  async confirm(uid: string) {
    const voucher = await this.voucherRepository.findOne({
      where: { uid },
    });

    if (!voucher) {
      throw new NotFoundException(`Voucher ${uid} not found`);
    }

    if (voucher.status !== VoucherStatus.ACTIVATED) {
      throw new BadRequestException(`Voucher status is not ready to be used`);
    }

    if (
      voucher.voucherType !== VoucherType.B_QUIK_DIESEL &&
      voucher.voucherType !== VoucherType.B_QUIK_BENZINE
    ) {
      throw new BadRequestException(`Voucher type is not confirmable`);
    }

    if (!voucher.redeemedAt) {
      throw new BadRequestException(`Voucher has not been redeemed yet`);
    }

    // NOTE: BQuik vouchers expire in 1 hour.
    const currentDate = new Date();
    const redeemedAt = voucher.redeemedAt;
    const redeemableTo = new Date(
      redeemedAt.setHours(redeemedAt.getHours() + 1),
    );

    if (redeemableTo < currentDate) {
      throw new BadRequestException(`Voucher has expired`);
    }

    voucher.status = VoucherStatus.USED;
    voucher.usedAt = new Date();

    return await this.voucherRepository.save(voucher);
  }

  @Cron(CronExpression.EVERY_DAY_AT_1AM, {
    name: 'checkExpiredVouchers',
  })
  async checkExpiredVouchers() {
    const expiredYearsLimit = this.configService.get<string>(
      'voucher.expiredYearsLimit',
    );

    return await this.voucherRepository
      .createQueryBuilder()
      .update(Voucher)
      .set({ status: VoucherStatus.EXPIRED, expiredAt: new Date() })
      .where(
        `TIMEZONE('UTC', NOW()) - activatedAt >= INTERVAL '${expiredYearsLimit} year'`,
      )
      .andWhere('status IN(:...status)', {
        status: [VoucherStatus.ACTIVATED],
      })
      .andWhere('voucherType IN(:...voucherType)', {
        voucherType: [
          VoucherType.ROADSIDE_ASSIST,
          VoucherType.B_QUIK_BENZINE,
          VoucherType.B_QUIK_DIESEL,
        ],
      })
      .execute();
  }

  private async activateVoucher(
    dto: CreateVoucherDto,
    user: User,
  ): Promise<Voucher> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const {
        voucherType,
        carBrand,
        carModel,
        carPlateNumber,
        ownerFirstName,
        ownerLastName,
        ownerPhoneNumber,
      } = dto;
      const voucherRepository = queryRunner.manager.getRepository(Voucher);
      const userRepository = queryRunner.manager.getRepository(User);
      const activatedAt = new Date();

      const currentDate = new Date();
      const expiredAt = new Date(
        currentDate.setFullYear(currentDate.getFullYear() + 1),
      );

      const voucher = voucherRepository.create({
        voucherType: voucherType,
        status: VoucherStatus.ACTIVATED,
        activatedAt,
        expiredAt,
        user: user,
        voucherDetail: {
          carBrand,
          carModel,
          carPlateNumber,
          carInformation: carBrand.concat(', ', carModel),
          ownerFirstName,
          ownerLastName,
          ownerPhoneNumber,
          ownerFullName: ownerFirstName.concat(' ', ownerLastName),
          attachments: dto.attachments,
        },
      });
      await voucherRepository.save(voucher);

      switch (voucherType) {
        case VoucherType.ROADSIDE_ASSIST:
          user.roadsideAssistBalance -= 1;
          break;
        case VoucherType.B_QUIK_BENZINE:
          user.bquikBenzineBalance -= 1;
          break;
        case VoucherType.B_QUIK_DIESEL:
          user.bquikDieselBalance -= 1;
          break;
      }

      await userRepository.save(user);

      await queryRunner.commitTransaction();

      await this.sendProviderVoucherEmail({
        voucher: {
          voucherType,
          activatedAt: voucher.activatedAt,
          uid: voucher.uid,
        },
        car: {
          brand: carBrand,
          model: carModel,
          plateNumber: carPlateNumber,
        },
        client: {
          firstName: ownerFirstName,
          lastName: ownerLastName,
          phoneNumber: ownerPhoneNumber,
        },
      });

      await this.sendUserVoucherEmail({
        uid: voucher.uid,
        isCMUVoucher: voucher.voucherType == VoucherType.CARSMEUP_CERTIFIED,
        voucherId: voucher.id,
        client: {
          email: user.email,
          firstName: ownerFirstName,
          lastName: ownerLastName,
        },
      });

      return voucher;
    } catch (err) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  private async checkCarAlreadyActivatedVoucher(
    voucherType: VoucherType,
    carPlateNumber: string,
    userId: number,
    id?: number,
  ) {
    if (voucherType === VoucherType.ROADSIDE_ASSIST) {
      const voucherQuery = this.voucherRepository
        .createQueryBuilder('voucher')
        .innerJoin('voucher.voucherDetail', 'voucherDetail')
        .where('voucher.voucherType = :voucherType', { voucherType })
        .andWhere('voucher.userId = :userId', { userId })
        .andWhere('voucherDetail.carPlateNumber = :carPlateNumber', {
          carPlateNumber,
        });

      if (id) voucherQuery.andWhere({ id: Not(id) });

      const voucher = await voucherQuery.getOne();

      if (voucher) {
        throw new BadRequestException(
          `The car with plate number ${carPlateNumber} has already activated ROADSIDE ASSIST voucher`,
        );
      }
    }
  }

  async sendProviderVoucherEmail(payload: IProviderVoucher) {
    const { voucher, client, car } = payload;

    let provider: string;
    let clientInformation = `${client.firstName} ${client.lastName}`;
    let carInformation = `${car.brand} ${car.model}, ${car.plateNumber}`;

    let activatedAt = DateTime.fromJSDate(voucher.activatedAt)
      .plus({ hours: 7 })
      .toFormat('dd LLL yyyy, HH:mm');

    const expiredAt = DateTime.fromJSDate(voucher.activatedAt)
      .plus({ hours: 7 })
      .plus({ years: 1 })
      .toFormat('dd LLL yyyy, HH:mm');

    switch (voucher.voucherType) {
      case VoucherType.ROADSIDE_ASSIST: {
        provider = 'Roadside assistance provider company';
        clientInformation = `${clientInformation}, ${client.phoneNumber}`;
        activatedAt = `${activatedAt} - ${expiredAt}`;
        break;
      }
      case VoucherType.B_QUIK_BENZINE:
      case VoucherType.B_QUIK_DIESEL: {
        provider = 'B-Quik';
        activatedAt = `${activatedAt} - ${expiredAt}`;
        break;
      }
      case VoucherType.CARSMEUP_CERTIFIED: {
        provider = 'Cockpit';
        carInformation = `${car.manufacturedYear} ${car.brand} ${car.model} ${car.subModel}, ${car.plateNumber}`;
        clientInformation = `${clientInformation} ${client.phoneNumber} ${client.email}`;
        break;
      }
    }

    const providerPayload: IProviderVoucherPayload = {
      provider,
      voucherType: voucher.voucherType,
      clientInformation,
      carInformation,
      activated: activatedAt,
      uid: voucher.uid,
    };

    await this.emailService.sendProviderVoucher(providerPayload);
  }

  async sendUserVoucherEmail(payload: IUserVoucher) {
    const { client, voucherId, uid, isCMUVoucher } = payload;
    const userPayload: IUserVoucherPayload = {
      email: client.email,
      clientInformation: `${client.firstName} ${client.lastName}`,
      voucherId,
      uid,
      isCMUVoucher,
    };
    await this.emailService.sendUserVoucher(userPayload);
  }

  async uploadAttachment(
    file: Express.Multer.File,
    dto: UploadVoucherAttachmentDto,
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

  async remove(id: number) {
    const voucher = await this.voucherRepository.findOne({
      where: {
        id: id,
      },
    });

    if (!voucher) {
      throw new NotFoundException(`Voucher ${id} not found`);
    }

    if (voucher.voucherType === VoucherType.CARSMEUP_CERTIFIED) {
      throw new BadRequestException(
        'Voucher of type Carsmeup certified cannot be deleted',
      );
    }

    return await this.voucherRepository.remove(voucher);
  }
}
