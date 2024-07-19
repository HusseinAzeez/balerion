import { CmuCertifiedRequestStatus } from '@/common/enums/cmu-certified-request.enum';
import { filenameBuffer } from '@/common/helpers/multer.helper';
import { Attachment } from '@/db/entities/attachment.entity';
import { CmuCertifiedRequest } from '@/db/entities/cmu-certified-request.entity';
import { Staff } from '@/db/entities/staff.entity';
import { S3FileService } from '@/services/s3-file.service';
import { VoucherStatus, VoucherType } from '@/common/enums/voucher.enum';
import { Car } from '@/db/entities/car.entity';
import { User } from '@/db/entities/user.entity';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { extname } from 'path';
import { DataSource, Repository } from 'typeorm';
import { PaginationsService } from '../paginations/paginations.service';
import { CreateCmuCertifiedRequestDto } from './dto/create-cmu-certified-request.dto';
import { QueryCmuCertifiedRequest } from './dto/query-cmu-certified-request.dto';
import { ReviewCmuCertifiedRequest } from './dto/review-cmu-certified-request.dto';
import { UpdateCmuCertifiedRequestDto } from './dto/update-cmu-certified-request.dto';
import { UploadCMUCertifiedRequestAttachmentDto } from './dto/upload-cmu-certified-request-attachment.dto';
import { EmailService } from '../email/email.service';
import {
  ICmuCertifiedRequestApprovalPayload,
  ICmuCertifiedRequestsApproval,
  ICmuCertifiedRequestsOnHold,
  ICmuCertifiedRequestsOnHoldPayload,
} from '../email/email.interface';
import { AttachmentType } from '@/common/enums/attachment.enum';
import { NotificationsService } from '../notifications/notifications.service';
import { VouchersService } from '../vouchers/vouchers.service';

@Injectable()
export class CmuCertifiedRequestsService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly emailService: EmailService,
    private readonly paginationsService: PaginationsService,
    private readonly s3FileService: S3FileService,
    private readonly notificationsService: NotificationsService,
    private readonly voucherService: VouchersService,

    @InjectRepository(CmuCertifiedRequest)
    private readonly cmuCertifiedRequestRepository: Repository<CmuCertifiedRequest>,

    @InjectRepository(Staff)
    private readonly staffRepository: Repository<Staff>,

    @InjectRepository(Attachment)
    private readonly attachmentRepository: Repository<Attachment>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Car)
    private readonly carRepository: Repository<Car>,
  ) {}

  async create(dto: CreateCmuCertifiedRequestDto, currentUserId: number) {
    const user = await this.userRepository.findOne({
      where: { id: currentUserId },
    });

    if (!user) {
      throw new NotFoundException(`User id #${currentUserId} not found`);
    }

    const CMURequests = [];

    if (user.carsmeupCertifiedBalance < dto.carDetails.length) {
      throw new BadRequestException(
        `User id #${currentUserId} does not have enough Carsmeup certified balance`,
      );
    }

    for (const carDetail of dto.carDetails) {
      const car = await this.carRepository.findOne({
        where: { id: carDetail.carId },
      });

      if (!car) {
        throw new NotFoundException(`Car id #${carDetail.carId} not found`);
      }

      if (car.cmuCertifiedRequest) {
        throw new BadRequestException(
          `Car id #${carDetail.carId} already has CMU certification request`,
        );
      }

      car.plateNumber = carDetail.plateNumber;
      await this.carRepository.save(car);

      const cmuRequest = await this.activateRequest(car, user);

      CMURequests.push(cmuRequest);
    }

    return CMURequests;
  }

  async findAll(dto: QueryCmuCertifiedRequest) {
    const { role, search, sortBy, sortDirection, limitPerPage, all, page } =
      dto;

    const query = this.cmuCertifiedRequestRepository
      .createQueryBuilder('cmuCertifiedRequest')
      .leftJoinAndSelect('cmuCertifiedRequest.car', 'car')
      .leftJoinAndSelect(
        'car.attachments',
        'attachments',
        'attachments.attachmentType = :attachmentType',
        { attachmentType: AttachmentType.EXTERIOR },
      )
      .leftJoinAndSelect('cmuCertifiedRequest.requestedBy', 'requestedBy')
      .where('cmuCertifiedRequest.status = :status', {
        status: CmuCertifiedRequestStatus.WAITING_APPROVAL,
      });

    if (role) {
      query.andWhere('requestedBy.role = :role', { role });
    }

    if (search) {
      query.andWhere(
        `(
          car.uid ILIKE :search OR
          car.brandName ILIKE :search OR
          car.modelName ILIKE :search OR
          car.subModelName ILIKE :search OR
          car.bodyTypeName ILIKE :search OR
          requestedBy.firstName ILIKE :search OR
          requestedBy.lastName ILIKE :search OR
          requestedBy.dealerName Ilike :search OR
          CONCAT_WS(' ', requestedBy.firstName, requestedBy.lastName) ILIKE :search)`,
        {
          search: `%${search}%`,
        },
      );
    }

    query.orderBy(`${sortBy}`, sortDirection as 'ASC' | 'DESC');

    return await this.paginationsService.paginate(query, {
      limitPerPage,
      all,
      page,
    });
  }

  async findOne(id: number) {
    const request = await this.cmuCertifiedRequestRepository.findOne({
      where: { id },
      relations: {
        car: true,
        attachment: true,
      },
    });

    if (!request) {
      throw new NotFoundException(
        `Carsmeup Certified request id #${id} not found`,
      );
    }

    return request;
  }

  async update(id: number, dto: UpdateCmuCertifiedRequestDto) {
    const request = await this.cmuCertifiedRequestRepository.findOne({
      where: { id },
      relations: {
        car: true,
        requestedBy: true,
      },
    });

    if (!request) {
      throw new NotFoundException(
        `Carsmeup Certified request id #${id} not found`,
      );
    }

    const shouldUpdateApprovedInfo =
      request.status !== CmuCertifiedRequestStatus.APPROVED &&
      dto.status === CmuCertifiedRequestStatus.APPROVED;
    const shouldUpdateOnHoldInfo =
      request.status !== CmuCertifiedRequestStatus.ON_HOLD &&
      dto.status === CmuCertifiedRequestStatus.ON_HOLD;

    request.exterior = dto.exterior;
    request.interior = dto.interior;
    request.engineCompartment = dto.engineCompartment;
    request.status = dto.status;

    if (dto.attachment) {
      request.attachment = dto.attachment;
    }

    if (shouldUpdateApprovedInfo) {
      request.approvedAt = new Date();

      await this.carRepository.update(
        { id: request.car.id },
        { isCarsmeupCertified: true },
      );

      await this.sendApprovalCmuCertifiedRequestEmail({
        email: request.requestedBy.email,
        car: {
          uid: request.car.uid,
          id: request.car.id,
          manufacturedYear: request.car.manufacturedYear,
          brandName: request.car.brandName,
          modelName: request.car.modelName,
          subModelName: request.car.subModelName,
          engineName: request.car.engineName,
        },
      });
    }

    if (shouldUpdateOnHoldInfo) {
      request.onHoldAt = new Date();
      request.onHoldReason = dto.onHoldReason;

      await this.carRepository.update(
        { id: request.car.id },
        { isCarsmeupCertified: false },
      );

      await this.sendOnHoldCmuCertifiedRequestEmail({
        email: request.requestedBy.email,
        car: {
          uid: request.car.uid,
          brandName: request.car.brandName,
          modelName: request.car.modelName,
          subModelName: request.car.subModelName,
          manufacturedYear: request.car.manufacturedYear,
        },
        reason: dto.onHoldReason,
      });
    }

    return await this.cmuCertifiedRequestRepository.save(request);
  }

  async review(
    id: number,
    dto: ReviewCmuCertifiedRequest,
    currentStaffId: number,
  ) {
    const staff = await this.staffRepository.findOne({
      where: { id: currentStaffId },
    });

    if (!staff) {
      throw new NotFoundException(`Staff id #${currentStaffId} not found`);
    }

    const request = await this.cmuCertifiedRequestRepository.findOne({
      where: { id },
      relations: {
        car: true,
        requestedBy: true,
        voucher: true,
      },
    });

    if (!request) {
      throw new NotFoundException(
        `Carsmeup Certified request id #${id} not found`,
      );
    }

    if (request.status !== CmuCertifiedRequestStatus.WAITING_APPROVAL) {
      throw new BadRequestException(
        `Carsmeup Certified request id #${id} has been reviewed.`,
      );
    }

    request.exterior = dto.exterior;
    request.interior = dto.interior;
    request.engineCompartment = dto.engineCompartment;
    request.reviewedBy = staff;
    request.status = dto.status;

    if (dto.status === CmuCertifiedRequestStatus.APPROVED) {
      request.approvedAt = new Date();
      request.voucher.status = VoucherStatus.APPROVED;

      await this.carRepository.update(
        { id: request.car.id },
        { isCarsmeupCertified: true },
      );
    }

    if (dto.status === CmuCertifiedRequestStatus.ON_HOLD) {
      request.onHoldAt = new Date();
      request.onHoldReason = dto.onHoldReason;
      request.voucher.status = VoucherStatus.ON_HOLD;
    }

    if (dto.attachment) {
      request.attachment = dto.attachment;
    }

    const cmuRequest = await this.cmuCertifiedRequestRepository.save(request);

    if (dto.status === CmuCertifiedRequestStatus.ON_HOLD) {
      await this.sendOnHoldCmuCertifiedRequestEmail({
        email: request.requestedBy.email,
        car: {
          uid: request.car.uid,
          brandName: request.car.brandName,
          modelName: request.car.modelName,
          subModelName: request.car.subModelName,
          manufacturedYear: request.car.manufacturedYear,
        },
        reason: dto.onHoldReason,
      });
    } else if (dto.status === CmuCertifiedRequestStatus.APPROVED) {
      await this.sendApprovalCmuCertifiedRequestEmail({
        email: request.requestedBy.email,
        car: {
          id: request.car.id,
          uid: request.car.uid,
          manufacturedYear: request.car.manufacturedYear,
          brandName: request.car.brandName,
          modelName: request.car.modelName,
          subModelName: request.car.subModelName,
          engineName: request.car.engineName,
        },
      });

      await this.notificationsService.createCMUCertifiedNotification({
        userId: cmuRequest.car.userId,
        carId: cmuRequest.car.id,
        status: cmuRequest.status,
        carInformation: [
          cmuRequest.car.brandName,
          cmuRequest.car.modelName,
          cmuRequest.car.subModelName,
        ].join(' '),
      });
    }

    return cmuRequest;
  }

  async uploadAttachment(
    file: Express.Multer.File,
    dto: UploadCMUCertifiedRequestAttachmentDto,
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

  private async activateRequest(
    car: Car,
    user: User,
  ): Promise<CmuCertifiedRequest> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const cmuCertifiedRequestRepository =
        queryRunner.manager.getRepository(CmuCertifiedRequest);
      const userRepository = queryRunner.manager.getRepository(User);

      const cmuRequest = cmuCertifiedRequestRepository.create({
        car,
        requestedBy: user,
        voucher: {
          voucherType: VoucherType.CARSMEUP_CERTIFIED,
          status: VoucherStatus.ACTIVATED,
          activatedAt: new Date(),
          user: user,
          voucherDetail: {
            carBrand: car.brandName,
            carModel: car.modelName,
            carPlateNumber: car.plateNumber,
            carSubModel: car.subModelName,
            carManufacturedYear: car.manufacturedYear,
            carInformation: [
              car.manufacturedYear.toString(),
              car.brandName,
              car.modelName,
              car.subModelName,
            ].join(' '),
            ownerFirstName: user.firstName,
            ownerLastName: user.lastName,
            ownerPhoneNumber: user.phoneNumber,
            ownerFullName: [user.firstName, user.lastName].join(' '),
            ownerEmail: user.email,
          },
        },
      });

      const cmuRequestResult = await cmuCertifiedRequestRepository.save(
        cmuRequest,
      );

      user.carsmeupCertifiedBalance -= 1;

      await userRepository.save(user);

      await queryRunner.commitTransaction();

      const { voucherType, activatedAt, uid } = cmuRequestResult.voucher;
      const {
        carBrand,
        carModel,
        carPlateNumber,
        carManufacturedYear,
        carSubModel,
        ownerFirstName,
        ownerLastName,
        ownerPhoneNumber,
        ownerEmail,
      } = cmuRequestResult.voucher.voucherDetail;

      await this.voucherService.sendProviderVoucherEmail({
        voucher: {
          uid,
          voucherType,
          activatedAt,
        },
        car: {
          brand: carBrand,
          model: carModel,
          plateNumber: carPlateNumber,
          manufacturedYear: carManufacturedYear,
          subModel: carSubModel,
        },
        client: {
          firstName: ownerFirstName,
          lastName: ownerLastName,
          phoneNumber: ownerPhoneNumber,
          email: ownerEmail,
        },
      });

      await this.voucherService.sendUserVoucherEmail({
        uid,
        isCMUVoucher: voucherType == VoucherType.CARSMEUP_CERTIFIED,
        voucherId: cmuRequestResult.voucher.id,
        client: {
          email: user.email,
          firstName: ownerFirstName,
          lastName: ownerLastName,
        },
      });

      return cmuRequestResult;
    } catch (error) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  private async sendOnHoldCmuCertifiedRequestEmail(
    payload: ICmuCertifiedRequestsOnHold,
  ) {
    const { email, car, reason } = payload;
    const onHoldPayload: ICmuCertifiedRequestsOnHoldPayload = {
      email,
      reason,
      uid: car.uid,
      carDetail: `${car.manufacturedYear} ${car.brandName} ${car.modelName} ${car.subModelName}`,
    };
    await this.emailService.sendOnHoldCmuCertifiedRequest(onHoldPayload);
  }

  private async sendApprovalCmuCertifiedRequestEmail(
    payload: ICmuCertifiedRequestsApproval,
  ) {
    const { email, car } = payload;
    const approvalPayload: ICmuCertifiedRequestApprovalPayload = {
      email,
      carId: car.id,
      uid: car.uid,
      carDetail: [
        car.manufacturedYear,
        car.brandName,
        car.modelName,
        car.subModelName,
        car.engineName,
      ].join(' '),
    };
    await this.emailService.sendApprovalCmuCertifiedRequest(approvalPayload);
  }
}
