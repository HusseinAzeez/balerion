import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, DataSource, In, Not, Repository, Brackets } from 'typeorm';
import { isEmpty, isNil } from 'lodash';
import { extname } from 'path';

import { filenameBuffer } from '@/common/helpers/multer.helper';
import { CarStatus, CarType } from '@/common/enums/car.enum';
import { CarBrand } from '@/db/entities/car-brand.entity';
import { CarModel } from '@/db/entities/car-model.entity';
import { CarSubModel } from '@/db/entities/car-sub-model.entity';
import { CarYear } from '@/db/entities/car-year.entity';
import { Car } from '@/db/entities/car.entity';
import { User } from '@/db/entities/user.entity';
import { CarFuelType } from '@/db/entities/car-fuel-type.entity';
import { CarBodyType } from '@/db/entities/car-body-type.entity';
import { CarEngine } from '@/db/entities/car-engine.entity';
import { CarTransmission } from '@/db/entities/car-transmission.entity';
import { CarLifestyle } from '@/db/entities/car-lifestyle.entity';
import { CarEquipment } from '@/db/entities/car-equipment.entity';
import { Staff } from '@/db/entities/staff.entity';
import { Attachment } from '@/db/entities/attachment.entity';
import { MonthlyInstallment } from '@/db/entities/monthly-installment.entity';

import { PaginationsService } from '../paginations/paginations.service';
import { QueryCarDto } from './dto/query-car.dto';
import { UpdateCarByStaffDto } from './dto/update-car-by-staff.dto';
import { DeleteCarDto } from './dto/delete-car.dto';
import { QueryTransmissionDto } from './dto/query-transmission.dto';
import { QueryFuelTypeDto } from './dto/query-fuel-type.dto';
import { QueryBodyTypeDto } from './dto/query-body-type.dto';
import { QueryEngineDto } from './dto/query-engine.dto';
import { QueryModelDto } from './dto/query-model.dto';
import { QuerySubModelDto } from './dto/query-sub-model.dto';
import { QueryBrandDto } from './dto/query-brand.dto';
import { QueryYearDto } from './dto/query-year.dto';
import { Car4sureService, S3FileService, StripeService } from '@/services';
import { RejectCarDto } from './dto/reject-car.dto';
import { UploadCarAttachmentDto } from './dto/upload-car-attachment.dto';
import { QueryMonthlyInstallmentDto } from './dto/query-monthly-installment.dto';
import { calculateMonthlyInstallment } from '@/common/helpers/car.helper';
import { QueryMarketpriceDto } from './dto/query-marketprice.dto';
import { CarMarketprice } from '@/db/entities/car-marketprice.entity';
import { UpdateCarByUserDto } from './dto/update-car-by-user.dto';
import { QueryCarByUserDto } from './dto/query-car-by-user.dto';
import { QueryCarByStaffDto } from './dto/query-car-by-staff.dto';
import { QueryEquipmentDto } from './dto/query-equipment.dto';
import { SellCarDto } from './dto/sell-car.dto';
import { UserRole, UserStatus } from '@/common/enums/user.enum';
import { humanize } from '@/common/helpers/enum.helper';
import { ChatProducer } from '../chats/producers/chat.producer';
import { AttachmentType } from '@/common/enums/attachment.enum';
import { QuerySaveCarDto } from './dto/query-save-car.dto';
import { SaveCar } from '@/db/entities/save-car.entity';
import { ProductPriceType } from '@/common/enums/product-price.enum';
import { ApplyHotDealDto } from './dto/apply-hot-deal.dto';
import { ApplyBumpDto } from './dto/apply-bump.dto';
import { QueryCarHotDealDto } from './dto/query-car-hot-deal.dto';
import { CmuCertifiedRequest } from '@/db/entities/cmu-certified-request.entity';
import { VoucherStatus, VoucherType } from '@/common/enums/voucher.enum';
import { IFindAdditionalSimilarCars } from './cars.interface';
import { MoveCarToBinDto } from './dto/move-car-to-bin.dto';
import { EmailService } from '../email/email.service';
import { ApplyLoanInformation } from './dto/apply-loan-information.dto';
import { CreateCarByStaffDto } from './dto/create-car-by-staff.dto';
import { CreateCarByUserDto } from './dto/create-car-by-user.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { DateTime } from 'luxon';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { QueryLifestyleDto } from './dto/query-lifestyle.dto';
import { VouchersService } from '../vouchers/vouchers.service';
import { CmuCertifiedRequestStatus } from '@/common/enums/cmu-certified-request.enum';

@Injectable()
export class CarsService {
  private readonly logger = new Logger(CarsService.name);

  constructor(
    private readonly paginationsService: PaginationsService,
    private readonly s3FileService: S3FileService,
    private readonly configService: ConfigService,
    private readonly chatProducer: ChatProducer,
    private readonly car4sureService: Car4sureService,
    private readonly stripeService: StripeService,
    private readonly dataSource: DataSource,
    private readonly emailService: EmailService,
    private readonly notificationsService: NotificationsService,
    private readonly voucherService: VouchersService,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Car)
    private readonly carRepository: Repository<Car>,

    @InjectRepository(CarBrand)
    private readonly carBrandRepository: Repository<CarBrand>,

    @InjectRepository(CarModel)
    private readonly carModelRepository: Repository<CarModel>,

    @InjectRepository(CarYear)
    private readonly carYearRepository: Repository<CarYear>,

    @InjectRepository(CarSubModel)
    private readonly carSubModelRepository: Repository<CarSubModel>,

    @InjectRepository(CarFuelType)
    private readonly carFuelTypeRepository: Repository<CarFuelType>,

    @InjectRepository(CarBodyType)
    private readonly carBodyTypeRepository: Repository<CarBodyType>,

    @InjectRepository(CarEngine)
    private readonly carEngineRepository: Repository<CarEngine>,

    @InjectRepository(CarTransmission)
    private readonly carTransmissionRepository: Repository<CarTransmission>,

    @InjectRepository(CarLifestyle)
    private readonly carLifestyleRepository: Repository<CarLifestyle>,

    @InjectRepository(CarEquipment)
    private readonly carEquipmentRepository: Repository<CarEquipment>,

    @InjectRepository(Attachment)
    private readonly attachmentRepository: Repository<Attachment>,

    @InjectRepository(MonthlyInstallment)
    private readonly monthlyInstallmentRepository: Repository<MonthlyInstallment>,

    @InjectRepository(CarMarketprice)
    private readonly carMarketpriceRepository: Repository<CarMarketprice>,

    @InjectRepository(CmuCertifiedRequest)
    private readonly cmuCertifiedRequestRepository: Repository<CmuCertifiedRequest>,

    @InjectRepository(SaveCar)
    private readonly saveCarRepository: Repository<SaveCar>,
  ) {}

  async createByUser(dto: CreateCarByUserDto, user: User) {
    const {
      brandName,
      modelName,
      manufacturedYear,
      subModelName,
      transmissionName,
      bodyTypeName,
      engineName,
      fuelTypeName,
      lifestyleName,
      equipmentList,
      willHaveBump,
      willHaveHotDeal,
      willHaveCMUCertified,
      isOther,
      status,
    } = dto;

    const car = this.carRepository.create({
      ...dto,
    });

    let brand = await this.carBrandRepository.findOne({
      where: { name: brandName },
    });

    let model = await this.carModelRepository.findOne({
      where: { name: modelName },
    });

    const year = await this.carYearRepository.findOne({
      where: { name: manufacturedYear },
    });

    let subModel = await this.carSubModelRepository.findOne({
      where: {
        name: subModelName,
        model: { name: modelName },
        years: { name: manufacturedYear },
      },
    });

    let transmission = await this.carTransmissionRepository.findOne({
      where: { name: transmissionName },
    });

    let fuelType = await this.carFuelTypeRepository.findOne({
      where: { name: fuelTypeName },
    });

    let bodyType = await this.carBodyTypeRepository.findOne({
      where: { name: bodyTypeName },
    });

    let engine = await this.carEngineRepository.findOne({
      where: { name: engineName },
    });

    let lifestyle = await this.carLifestyleRepository.findOne({
      where: { name: lifestyleName },
    });

    if (isOther) {
      car.isOther = true;

      if (!brand) {
        brand = this.carBrandRepository.create({
          name: brandName,
          displayable: false,
        });

        brand = await this.carBrandRepository.save(brand);
      }

      if (!model) {
        model = this.carModelRepository.create({
          name: modelName,
          displayable: false,
          brand: brand,
        });

        model = await this.carModelRepository.save(model);
      }

      if (!subModel) {
        subModel = this.carSubModelRepository.create({
          name: subModelName,
          displayable: false,
          model: model,
        });

        subModel.years = [year];
        subModel = await this.carSubModelRepository.save(subModel);
      }

      if (!transmission) {
        transmission = this.carTransmissionRepository.create({
          name: transmissionName,
          displayable: false,
        });

        transmission = await this.carTransmissionRepository.save(transmission);
      }

      if (!fuelType) {
        fuelType = this.carFuelTypeRepository.create({
          name: fuelTypeName,
          displayable: false,
        });

        fuelType = await this.carFuelTypeRepository.save(fuelType);
      }

      if (!bodyType) {
        bodyType = this.carBodyTypeRepository.create({
          name: bodyTypeName,
          displayable: false,
        });

        bodyType = await this.carBodyTypeRepository.save(bodyType);
      }

      if (!engine) {
        engine = this.carEngineRepository.create({
          name: engineName,
          displayable: false,
        });

        engine = await this.carEngineRepository.save(engine);
      }

      if (!lifestyle) {
        lifestyle = this.carLifestyleRepository.create({
          name: lifestyleName,
          displayable: false,
        });

        lifestyle = await this.carLifestyleRepository.save(lifestyle);
      }
    } else {
      if (!brand) {
        throw new NotFoundException(`Brand ${brandName} not found`);
      }

      if (!model) {
        throw new NotFoundException(`Model ${modelName} not found`);
      }

      if (!subModel) {
        throw new NotFoundException(`Sub model ${subModelName} not found`);
      }

      if (!transmission) {
        throw new NotFoundException(
          `Transmission ${transmissionName} not found`,
        );
      }

      if (!fuelType) {
        throw new NotFoundException(`Fuel type ${fuelTypeName} not found`);
      }

      if (!bodyType) {
        throw new NotFoundException(`Body type ${bodyTypeName} not found`);
      }

      if (!engine) {
        throw new NotFoundException(`Engine ${engineName} not found`);
      }

      if (!lifestyle) {
        throw new NotFoundException(`Lifestyle ${lifestyleName} not found`);
      }
    }

    car.brand = brand;
    car.model = model;
    car.subModel = subModel;
    car.transmission = transmission;
    car.fuelType = fuelType;
    car.bodyType = bodyType;
    car.engine = engine;
    car.lifestyle = lifestyle;
    car.user = user;
    car.status = status;
    car.equipments = await this.createEquipments(equipmentList);
    car.totalPrice = car.price;
    if (car.discount) {
      car.totalPrice = car.price - car.discount;
    }

    if (status === CarStatus.PENDING_APPROVAL) {
      await this.canPublish(car);
      car.submittedAt = new Date();
    }

    if (willHaveBump) {
      await this.deductUserBalance(ProductPriceType.BUMP, user);
    }

    if (willHaveHotDeal) {
      await this.deductUserBalance(ProductPriceType.HOT_DEAL, user);
    }

    if (willHaveCMUCertified) {
      await this.deductUserBalance(ProductPriceType.CARSMEUP_CERTIFIED, user);
    }

    return this.carRepository.save(car);
  }

  async createByStaff(dto: CreateCarByStaffDto, staff: Staff) {
    const {
      userId,
      brandName,
      modelName,
      manufacturedYear,
      subModelName,
      transmissionName,
      bodyTypeName,
      engineName,
      fuelTypeName,
      lifestyleName,
      equipmentList,
      isOther,
      status,
      price,
      discount,
    } = dto;

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User ${userId} not found`);
    }

    const car = this.carRepository.create({
      ...dto,
    });

    let brand = await this.carBrandRepository.findOne({
      where: { name: brandName },
    });

    let model = await this.carModelRepository.findOne({
      where: { name: modelName },
    });

    const year = await this.carYearRepository.findOne({
      where: { name: manufacturedYear },
    });

    let subModel = await this.carSubModelRepository.findOne({
      where: {
        name: subModelName,
        model: { name: modelName },
        years: { name: manufacturedYear },
      },
    });

    let transmission = await this.carTransmissionRepository.findOne({
      where: { name: transmissionName },
    });

    let fuelType = await this.carFuelTypeRepository.findOne({
      where: { name: fuelTypeName },
    });

    let bodyType = await this.carBodyTypeRepository.findOne({
      where: { name: bodyTypeName },
    });

    let engine = await this.carEngineRepository.findOne({
      where: { name: engineName },
    });

    let lifestyle = await this.carLifestyleRepository.findOne({
      where: { name: lifestyleName },
    });

    if (isOther) {
      car.isOther = true;

      if (!brand) {
        brand = this.carBrandRepository.create({
          name: brandName,
          displayable: false,
        });

        brand = await this.carBrandRepository.save(brand);
      }

      if (!model) {
        model = this.carModelRepository.create({
          name: modelName,
          displayable: false,
          brand: brand,
        });

        model = await this.carModelRepository.save(model);
      }

      if (!subModel) {
        subModel = this.carSubModelRepository.create({
          name: subModelName,
          displayable: false,
          model: model,
        });

        subModel.years = [year];
        subModel = await this.carSubModelRepository.save(subModel);
      }

      if (!transmission) {
        transmission = this.carTransmissionRepository.create({
          name: transmissionName,
          displayable: false,
        });

        transmission = await this.carTransmissionRepository.save(transmission);
      }

      if (!fuelType) {
        fuelType = this.carFuelTypeRepository.create({
          name: fuelTypeName,
          displayable: false,
        });

        fuelType = await this.carFuelTypeRepository.save(fuelType);
      }

      if (!bodyType) {
        bodyType = this.carBodyTypeRepository.create({
          name: bodyTypeName,
          displayable: false,
        });

        bodyType = await this.carBodyTypeRepository.save(bodyType);
      }

      if (!engine) {
        engine = this.carEngineRepository.create({
          name: engineName,
          displayable: false,
        });

        engine = await this.carEngineRepository.save(engine);
      }

      if (!lifestyle) {
        lifestyle = this.carLifestyleRepository.create({
          name: lifestyleName,
          displayable: false,
        });

        lifestyle = await this.carLifestyleRepository.save(lifestyle);
      }
    } else {
      if (!brand) {
        throw new NotFoundException(`Brand ${brandName} not found`);
      }

      if (!model) {
        throw new NotFoundException(`Model ${modelName} not found`);
      }

      if (!subModel) {
        throw new NotFoundException(`Sub model ${subModelName} not found`);
      }

      if (!transmission) {
        throw new NotFoundException(
          `Transmission ${transmissionName} not found`,
        );
      }

      if (!fuelType) {
        throw new NotFoundException(`Fuel type ${fuelTypeName} not found`);
      }

      if (!bodyType) {
        throw new NotFoundException(`Body type ${bodyTypeName} not found`);
      }

      if (!engine) {
        throw new NotFoundException(`Engine ${engineName} not found`);
      }

      if (!lifestyle) {
        throw new NotFoundException(`Lifestyle ${lifestyleName} not found`);
      }
    }

    car.brand = brand;
    car.model = model;
    car.subModel = subModel;
    car.transmission = transmission;
    car.fuelType = fuelType;
    car.bodyType = bodyType;
    car.engine = engine;
    car.lifestyle = lifestyle;
    car.user = user;
    car.status = status;
    car.equipments = await this.createEquipments(equipmentList);
    car.totalPrice = price;
    if (discount) {
      car.totalPrice = price - discount;
    }

    if (status === CarStatus.PUBLISHED) {
      car.publishedAt = new Date();
      car.publishedBy = staff;
    }

    return this.carRepository.save(car);
  }

  async findAll(query: QueryCarDto) {
    const {
      search,
      brands,
      models,
      subModels,
      bodyTypes,
      lifestyles,
      fuelTypes,
      transmissions,
      colors,
      startMileage,
      endMileage,
      startPrice,
      endPrice,
      vatIncluded,
      startMonthlyInstallment,
      endMonthlyInstallment,
      startManufacturedYear,
      endManufacturedYear,
      province,
      district,
      withVideo,
      carType,
      sortBy,
      sortDirection,
      limitPerPage,
      all,
      page,
    } = query;

    const carQuery = this.carRepository
      .createQueryBuilder('car')
      .innerJoinAndSelect('car.user', 'user')
      .leftJoinAndSelect('car.cmuCertifiedRequest', 'cmuCertifiedRequest')
      .leftJoinAndSelect(
        'car.attachments',
        'attachments',
        'attachments.attachmentType = :attachmentType',
        { attachmentType: AttachmentType.EXTERIOR },
      )
      .where('car.status IN (:...status)', {
        status: [CarStatus.PUBLISHED, CarStatus.RESERVED],
      })
      .andWhere('user.deletedAt IS NULL')
      .andWhere('user.status != :userStatus', {
        userStatus: UserStatus.INACTIVE,
      });

    if (search) {
      carQuery.andWhere(
        `(car.uid ILIKE :search OR
          car.brand_name ILIKE :search OR
          car.model_name ILIKE :search OR
          car.sub_model_name ILIKE :search OR
          (car.manufacturedYear)::TEXT ILIKE :search)`,
        {
          search: `%${search}%`,
        },
      );
    }

    if (!isEmpty(brands)) {
      carQuery.andWhere(
        new Brackets((qb) => {
          qb.where('car.brand_name IN(:...brands)');

          if (!isEmpty(models)) {
            qb.orWhere('car.model_name IN(:...models)');
          }

          if (!isEmpty(subModels)) {
            qb.orWhere('car.sub_model_name IN(:...subModels)');
          }
        }),
        { brands, models, subModels },
      );
    } else if (!isEmpty(models)) {
      carQuery.andWhere(
        new Brackets((qb) => {
          qb.where('car.model_name IN(:...models)');

          if (!isEmpty(subModels)) {
            qb.orWhere('car.sub_model_name IN(:...subModels)');
          }
        }),
        { models, subModels },
      );
    } else if (!isEmpty(subModels)) {
      carQuery.andWhere('car.sub_model_name IN(:...subModels)', { subModels });
    }

    if (!isEmpty(bodyTypes)) {
      carQuery.andWhere('car.body_type_name IN(:...bodyTypes)', { bodyTypes });
    }

    if (!isEmpty(fuelTypes)) {
      carQuery.andWhere('car.fuel_type_name IN(:...fuelTypes)', { fuelTypes });
    }

    if (!isEmpty(lifestyles)) {
      carQuery.andWhere('car.lifestyle_name IN(:...lifestyles)', {
        lifestyles,
      });
    }

    if (!isEmpty(transmissions)) {
      carQuery.andWhere('car.transmission_name IN(:...transmissions)', {
        transmissions,
      });
    }

    if (!isEmpty(colors)) {
      carQuery.andWhere('car.color IN(:...colors)', { colors });
    }

    if (startMileage && endMileage) {
      carQuery.andWhere(
        'car.mileage >= :startMileage AND car.mileage <= :endMileage',
        { startMileage, endMileage },
      );
    }

    if (startPrice && endPrice) {
      if (vatIncluded) {
        carQuery.andWhere(
          '(car.price + (car.price * 0.07)) >= :startPrice AND (car.price + (car.price * 0.07)) <= :endPrice',
          { startPrice, endPrice },
        );
      } else {
        carQuery.andWhere(
          'car.price >= :startPrice AND car.price <= :endPrice',
          { startPrice, endPrice },
        );
      }
    }

    if (startMonthlyInstallment && endMonthlyInstallment) {
      carQuery.andWhere(
        'car.monthlyInstallment >= :startMonthlyInstallment AND car.monthlyInstallment <= :endMonthlyInstallment',
        { startMonthlyInstallment, endMonthlyInstallment },
      );
    }

    if (startManufacturedYear && endManufacturedYear) {
      carQuery.andWhere(
        'car.manufacturedYear >= :startManufacturedYear AND car.manufacturedYear <= :endManufacturedYear',
        { startManufacturedYear, endManufacturedYear },
      );
    }

    if (province) {
      carQuery.andWhere('car.province = :province', { province });
    }

    if (district) {
      carQuery.andWhere('car.district = :district', { district });
    }

    if (withVideo) {
      carQuery.andWhere('attachments.attachmentType = :attachmentType', {
        attachmentType: AttachmentType.VIDEO,
      });
    }

    if (carType) {
      if (carType === CarType.PRIVATE) {
        carQuery.andWhere('user.role = :userRole', {
          userRole: UserRole.PRIVATE,
        });
      } else if (carType === CarType.DEALER) {
        carQuery.andWhere('user.role = :userRole', {
          userRole: UserRole.DEALER,
        });
      } else if (carType === CarType.CARSMEUP_CERTIFIED) {
        carQuery.andWhere('car.isCarsmeupCertified = true');
      }
    }

    if (sortBy === 'car.bumpedAt') {
      carQuery
        .orderBy('car.bumpedAt', 'DESC', 'NULLS LAST')
        .addOrderBy('car.createdAt', 'DESC');
    } else if (sortBy === 'car.discount') {
      carQuery.orderBy('car.discount', 'DESC', 'NULLS LAST');
    } else {
      carQuery.orderBy(`${sortBy}`, sortDirection as 'ASC' | 'DESC');
    }
    return await this.paginationsService.paginate(carQuery, {
      limitPerPage,
      all,
      page,
    });
  }

  async findHotDeals(query: QueryCarHotDealDto) {
    const { sortBy, sortDirection, limitPerPage, all, page } = query;

    const carQuery = this.carRepository
      .createQueryBuilder('car')
      .leftJoinAndSelect('car.attachments', 'attachments')
      .innerJoinAndSelect('car.user', 'user')
      .where('car.status IN (:...status)', {
        status: [CarStatus.PUBLISHED, CarStatus.RESERVED],
      })
      .andWhere('car.hotDealedAt IS NOT NULL')
      .andWhere('user.deletedAt IS NULL')
      .andWhere('user.status != :userStatus', {
        userStatus: UserStatus.INACTIVE,
      });

    carQuery
      .orderBy('car.bumpedAt', 'DESC', 'NULLS LAST')
      .addOrderBy(`${sortBy}`, sortDirection as 'ASC' | 'DESC');

    return await this.paginationsService.paginate(carQuery, {
      limitPerPage,
      all,
      page,
    });
  }

  async findAllByStaff(staff: Staff, query: QueryCarByStaffDto) {
    const {
      search,
      brands,
      models,
      subModels,
      status,
      userRoles,
      postOnSocialMedia,
      province,
      district,
      attachmentTypes,
      sortBy,
      sortDirection,
      limitPerPage,
      all,
      page,
    } = query;

    const carQuery = this.carRepository
      .createQueryBuilder('car')
      .innerJoinAndSelect('car.user', 'user')
      .leftJoinAndSelect('car.attachments', 'attachments');

    if (search) {
      carQuery.andWhere(
        `(car.uid ILIKE :search OR
          car.brand_name ILIKE :search OR
          car.model_name ILIKE :search OR
          car.sub_model_name ILIKE :search OR
          (car.manufacturedYear)::TEXT ILIKE :search) OR
          user.firstName ILIKE :search OR
          user.lastName ILIKE :search OR
          user.dealerName ILIKE :search
          `,
        {
          search: `%${search}%`,
        },
      );
    }

    if (!isEmpty(brands)) {
      carQuery.andWhere(
        new Brackets((qb) => {
          qb.where('car.brand_name IN(:...brands)');

          if (!isEmpty(models)) {
            qb.orWhere('car.model_name IN(:...models)');
          }

          if (!isEmpty(subModels)) {
            qb.orWhere('car.sub_model_name IN(:...subModels)');
          }
        }),
        { brands, models, subModels },
      );
    } else if (!isEmpty(models)) {
      carQuery.andWhere(
        new Brackets((qb) => {
          qb.where('car.model_name IN(:...models)');

          if (!isEmpty(subModels)) {
            qb.orWhere('car.sub_model_name IN(:...subModels)');
          }
        }),
        { models, subModels },
      );
    } else if (!isEmpty(subModels)) {
      carQuery.andWhere('car.sub_model_name IN(:...subModels)', { subModels });
    }

    if (!isEmpty(status)) {
      carQuery.andWhere('car.status IN (:...status)', { status });
    }

    if (!isEmpty(userRoles)) {
      carQuery.andWhere('user.role IN (:...userRoles)', { userRoles });
    }

    if (postOnSocialMedia) {
      carQuery.andWhere('car.postOnSocialMedia = true');
    }

    if (province) {
      carQuery.andWhere('car.province = :province', { province });
    }

    if (district) {
      carQuery.andWhere('car.district = :district', { district });
    }

    if (!isEmpty(attachmentTypes)) {
      carQuery.andWhere('attachments.attachmentType IN (:...attachmentTypes)', {
        attachmentTypes,
      });
    }

    carQuery.orderBy(`${sortBy}`, sortDirection as 'ASC' | 'DESC');

    return await this.paginationsService.paginate(carQuery, {
      limitPerPage,
      all,
      page,
    });
  }

  async findAllByUser(user: User, query: QueryCarByUserDto) {
    const {
      search,
      brands,
      models,
      subModels,
      status,
      isHotDealed,
      isCarsmeupCertified,
      sortBy,
      sortDirection,
      limitPerPage,
      all,
      page,
    } = query;

    const carQuery = this.carRepository
      .createQueryBuilder('car')
      .innerJoinAndSelect('car.user', 'user')
      .leftJoinAndSelect('car.attachments', 'attachments')
      .leftJoinAndSelect('car.cmuCertifiedRequest', 'cmuCertifiedRequest')
      .where('user.id = :userId', { userId: user.id })
      .andWhere('car.isUnderRevision = false');

    carQuery.loadRelationCountAndMap('car.views', 'car.views');

    if (search) {
      carQuery.andWhere(
        `(car.uid ILIKE :search OR
          car.brand_name ILIKE :search OR
          car.model_name ILIKE :search OR
          car.sub_model_name ILIKE :search OR
          (car.manufacturedYear)::TEXT ILIKE :search)`,
        {
          search: `%${search}%`,
        },
      );
    }

    if (!isEmpty(brands)) {
      carQuery.andWhere(
        new Brackets((qb) => {
          qb.where('car.brand_name IN(:...brands)');

          if (!isEmpty(models)) {
            qb.orWhere('car.model_name IN(:...models)');
          }

          if (!isEmpty(subModels)) {
            qb.orWhere('car.sub_model_name IN(:...subModels)');
          }
        }),
        { brands, models, subModels },
      );
    } else if (!isEmpty(models)) {
      carQuery.andWhere(
        new Brackets((qb) => {
          qb.where('car.model_name IN(:...models)');

          if (!isEmpty(subModels)) {
            qb.orWhere('car.sub_model_name IN(:...subModels)');
          }
        }),
        { models, subModels },
      );
    } else if (!isEmpty(subModels)) {
      carQuery.andWhere('car.sub_model_name IN(:...subModels)', { subModels });
    }

    if (!isEmpty(status)) {
      carQuery.andWhere('car.status IN (:...status)', { status });
    }

    if (isHotDealed) {
      carQuery.andWhere('car.isHotDealed = true');
    }

    if (isCarsmeupCertified) {
      carQuery.andWhere('car.isCarsmeupCertified = true');
    }

    carQuery.orderBy(`${sortBy}`, sortDirection as 'ASC' | 'DESC');

    return await this.paginationsService.paginate(carQuery, {
      limitPerPage,
      all,
      page,
    });
  }

  async findAllSaveCarByUser(query: QuerySaveCarDto, currentUserId: number) {
    const { limitPerPage, all, page, attachmentType } = query;

    const carQuery = this.carRepository
      .createQueryBuilder('car')
      .innerJoinAndSelect(
        SaveCar,
        'saveCar',
        'saveCar.carId = car.id and saveCar.userId = :currentUserId',
        { currentUserId },
      )
      .leftJoinAndSelect(
        'car.attachments',
        'attachments',
        'attachments.attachmentType = :attachmentType',
        { attachmentType },
      )
      .orderBy('saveCar.createdAt', 'DESC');

    return await this.paginationsService.paginate(carQuery, {
      limitPerPage,
      all,
      page,
    });
  }

  async findOneSaveCarByUser(id: number, currentUserId: number) {
    const car = await this.carRepository
      .createQueryBuilder('car')
      .innerJoinAndSelect(
        SaveCar,
        'saveCar',
        'saveCar.carId = car.id and saveCar.userId = :currentUserId',
        { currentUserId },
      )
      .where('car.id = :id', { id })
      .getOne();

    if (!car) {
      throw new NotFoundException('Car is not saved');
    }

    return car;
  }

  async findOne(id: number) {
    const car = await this.carRepository
      .createQueryBuilder('car')
      .leftJoinAndSelect('car.attachments', 'attachments')
      .leftJoinAndSelect('car.user', 'user')
      .leftJoinAndSelect('user.attachments', 'userAttachments')
      .leftJoinAndSelect('car.cmuCertifiedRequest', 'cmuCertifiedRequest')
      .leftJoinAndSelect('cmuCertifiedRequest.voucher', 'voucher')
      .leftJoinAndSelect('cmuCertifiedRequest.attachment', 'attachment')
      .loadRelationCountAndMap('car.views', 'car.views')
      .where('car.id = :id', { id })
      .andWhere('user.deletedAt IS NULL')
      .andWhere('user.status != :status', { status: UserStatus.INACTIVE })
      .getOne();

    if (!car) {
      throw new NotFoundException(`Car ${id} not found`);
    }

    // NOTE(Hussein): Return original's version CMU Certified Request
    // if a new version
    if (!car.isCurrentVersion) {
      const currentVersion = await this.carRepository.findOne({
        where: { newVersion: { id: car.id } },
      });

      car.cmuCertifiedRequest =
        await this.cmuCertifiedRequestRepository.findOne({
          where: { car: { id: currentVersion.id } },
          relations: {
            requestedBy: true,
            reviewedBy: true,
            attachment: true,
          },
        });
    }

    return car;
  }

  async updateByUser(id: number, dto: UpdateCarByUserDto, user: User) {
    const car = await this.carRepository.findOne({
      where: { id: id },
      relations: {
        user: true,
        publishedBy: true,
        cmuCertifiedRequest: {
          voucher: {
            voucherDetail: true,
          },
        },
      },
    });

    if (!car) {
      throw new NotFoundException(`Car ${id} not found`);
    }

    if (car.status === CarStatus.EXPIRED || car.status === CarStatus.DELETED) {
      throw new BadRequestException('Car status is not ready to be updated');
    }

    const {
      brandName,
      modelName,
      manufacturedYear,
      subModelName,
      transmissionName,
      bodyTypeName,
      engineName,
      fuelTypeName,
      lifestyleName,
      status,
      color,
      otherColor,
      mileage,
      plateNumber,
      gasInstallation,
      registeredYear,
      ownership,
      price,
      discount,
      description,
      province,
      district,
      videoUrl,
      equipmentList,
      attachments,
      willHaveBump,
      willHaveHotDeal,
      willHaveCMUCertified,
      isOther,
    } = dto;

    if (
      car.status === CarStatus.DRAFT &&
      status === CarStatus.PENDING_APPROVAL
    ) {
      await this.canPublish(car);
    }

    let transmission = await this.carTransmissionRepository.findOne({
      where: { name: transmissionName },
    });

    let fuelType = await this.carFuelTypeRepository.findOne({
      where: { name: fuelTypeName },
    });

    let bodyType = await this.carBodyTypeRepository.findOne({
      where: { name: bodyTypeName },
    });

    let engine = await this.carEngineRepository.findOne({
      where: { name: engineName },
    });

    let lifestyle = await this.carLifestyleRepository.findOne({
      where: { name: lifestyleName },
    });

    if (car.status === CarStatus.PUBLISHED) {
      if (willHaveBump) {
        await this.activateProduct(ProductPriceType.BUMP, car);
      }

      if (willHaveHotDeal && !car.isHotDealed) {
        await this.activateProduct(ProductPriceType.HOT_DEAL, car);
      }

      if (willHaveCMUCertified && !car.cmuCertifiedRequest) {
        await this.activateProduct(ProductPriceType.CARSMEUP_CERTIFIED, car);
      }
    }

    let hasModifiedAttachments = false;
    if (!isEmpty(attachments)) {
      for (const attachment of attachments) {
        if (isNil(attachment.id)) hasModifiedAttachments = true;
      }
    }

    const newStatus = this.getCarNewStatus(
      car.status,
      status,
      user,
      hasModifiedAttachments,
    );

    car.updatedByUser = user;
    car.updatedByStaff = null;
    car.equipments = await this.createEquipments(equipmentList);

    if (car.isCurrentVersion) {
      if (newStatus === CarStatus.PENDING_EDIT_APPROVAL) {
        if (car.isUnderRevision) {
          throw new BadRequestException('Car is currently under revision');
        }

        car.transmission = transmission;
        car.fuelType = fuelType;
        car.bodyType = bodyType;
        car.engine = engine;
        car.lifestyle = lifestyle;
        car.ownership = ownership;
        car.color = color;
        car.otherColor = otherColor;
        car.mileage = mileage;
        car.plateNumber = plateNumber;
        car.gasInstallation = gasInstallation;
        car.registeredYear = registeredYear;
        car.province = province;
        car.district = district;
        car.description = description;
        car.videoUrl = videoUrl;
        car.price = price;
        car.discount = discount;
        car.totalPrice = price;
        if (discount) {
          car.totalPrice = price - discount;
        }

        const newVersionCar = this.carRepository.create({
          ...car,
          id: null,
          car4sureId: null,
          status: CarStatus.PENDING_EDIT_APPROVAL,
          brand: { name: car.brandName },
          model: { name: car.modelName },
          subModel: { name: car.subModelName },
          manufacturedYear: car.manufacturedYear,
          transmission: transmission,
          fuelType: fuelType,
          bodyType: bodyType,
          engine: engine,
          lifestyle: lifestyle,
          isCurrentVersion: false,
          user: user,
          submittedAt: new Date(),
          cmuCertifiedRequest: null,
        });

        if (!isEmpty(attachments)) {
          const newAttachments = [];
          for (const attachment of attachments) {
            const newAttachment = this.attachmentRepository.create({
              filename: attachment.filename,
              extension: attachment.extension,
              size: attachment.size,
              url: attachment.url,
              attachmentType: attachment.attachmentType,
              sequence: attachment.sequence,
            });
            newAttachments.push(newAttachment);
          }
          newVersionCar.attachments = newAttachments;
        }

        await this.carRepository.save(newVersionCar);

        car.newVersion = newVersionCar;
        car.isUnderRevision = true;

        await this.carRepository.save(car);

        return newVersionCar;
      }
    } else {
      let currentVersion = await this.carRepository.findOne({
        where: { newVersion: { id: car.id } },
        relations: {
          user: true,
          cmuCertifiedRequest: true,
        },
      });

      currentVersion.transmission = transmission;
      currentVersion.fuelType = fuelType;
      currentVersion.bodyType = bodyType;
      currentVersion.engine = engine;
      currentVersion.lifestyle = lifestyle;
      currentVersion.ownership = ownership;
      currentVersion.color = color;
      currentVersion.otherColor = otherColor;
      currentVersion.mileage = mileage;
      currentVersion.plateNumber = plateNumber;
      currentVersion.gasInstallation = gasInstallation;
      currentVersion.registeredYear = registeredYear;
      currentVersion.province = province;
      currentVersion.district = district;
      currentVersion.description = description;
      currentVersion.videoUrl = videoUrl;
      currentVersion.price = price;
      currentVersion.discount = discount;
      currentVersion.totalPrice = price;
      if (discount) {
        currentVersion.totalPrice = price - discount;
      }

      await this.carRepository.save(currentVersion);

      if (newStatus === CarStatus.PENDING_EDIT_APPROVAL) {
        if (willHaveBump) {
          currentVersion = await this.activateProduct(
            ProductPriceType.BUMP,
            currentVersion,
          );
          car.isBumped = currentVersion.isBumped;
          car.bumpedAt = currentVersion.bumpedAt;
        }

        if (willHaveHotDeal && !currentVersion.isHotDealed) {
          currentVersion = await this.activateProduct(
            ProductPriceType.HOT_DEAL,
            currentVersion,
          );
          car.isHotDealed = currentVersion.isHotDealed;
          car.hotDealedAt = currentVersion.hotDealedAt;
        }

        if (willHaveCMUCertified && !currentVersion.cmuCertifiedRequest) {
          currentVersion = await this.activateProduct(
            ProductPriceType.CARSMEUP_CERTIFIED,
            currentVersion,
          );
          car.isCarsmeupCertified = currentVersion.isCarsmeupCertified;
        }
      }
    }

    // Roles:
    // ============================================
    // 1. User can update only transmission, fuelType, bodyType,
    // engine, and lifestyle when isOther = false.
    //
    // 2. User can't update brand, model, sub model,
    // and manufactured year even when isOther = true.
    //
    // 3. User can update everything when status is DRAFT.

    if (car.status === CarStatus.DRAFT) {
      let brand = await this.carBrandRepository.findOne({
        where: { name: brandName },
      });

      let model = await this.carModelRepository.findOne({
        where: { name: modelName },
      });

      const year = await this.carYearRepository.findOne({
        where: { name: manufacturedYear },
      });

      let subModel = await this.carSubModelRepository.findOne({
        where: { name: subModelName, years: { name: manufacturedYear } },
      });

      if (!brand) {
        brand = this.carBrandRepository.create({
          name: brandName,
          displayable: false,
        });

        brand = await this.carBrandRepository.save(brand);
      }

      if (!model) {
        model = this.carModelRepository.create({
          name: modelName,
          displayable: false,
          brand: brand,
        });

        model = await this.carModelRepository.save(model);
      }

      if (!subModel) {
        subModel = this.carSubModelRepository.create({
          name: subModelName,
          displayable: false,
          model: model,
        });

        subModel.years = [year];
        subModel = await this.carSubModelRepository.save(subModel);
      }

      if (!transmission) {
        transmission = this.carTransmissionRepository.create({
          name: transmissionName,
          displayable: false,
        });

        transmission = await this.carTransmissionRepository.save(transmission);
      }

      if (!fuelType) {
        fuelType = this.carFuelTypeRepository.create({
          name: fuelTypeName,
          displayable: false,
        });

        fuelType = await this.carFuelTypeRepository.save(fuelType);
      }

      if (!bodyType) {
        bodyType = this.carBodyTypeRepository.create({
          name: bodyTypeName,
          displayable: false,
        });

        bodyType = await this.carBodyTypeRepository.save(bodyType);
      }

      if (!engine) {
        engine = this.carEngineRepository.create({
          name: engineName,
          displayable: false,
        });

        engine = await this.carEngineRepository.save(engine);
      }

      if (!lifestyle) {
        lifestyle = this.carLifestyleRepository.create({
          name: lifestyleName,
          displayable: false,
        });

        lifestyle = await this.carLifestyleRepository.save(lifestyle);
      }

      car.brand = brand;
      car.model = model;
      car.subModel = subModel;
      car.manufacturedYear = manufacturedYear;
    } else {
      if (!transmission) {
        throw new NotFoundException(
          `Transmission ${transmissionName} not found`,
        );
      }

      if (!fuelType) {
        throw new NotFoundException(`Fuel type ${fuelTypeName} not found`);
      }

      if (!bodyType) {
        throw new NotFoundException(`Body type ${bodyTypeName} not found`);
      }

      if (!engine) {
        throw new NotFoundException(`Engine ${engineName} not found`);
      }

      if (!lifestyle) {
        throw new NotFoundException(`Lifestyle ${lifestyleName} not found`);
      }
    }

    car.transmission = transmission;
    car.fuelType = fuelType;
    car.bodyType = bodyType;
    car.engine = engine;
    car.lifestyle = lifestyle;
    car.ownership = ownership;
    car.color = color;
    car.otherColor = otherColor;
    car.mileage = mileage;
    car.plateNumber = plateNumber;
    car.gasInstallation = gasInstallation;
    car.registeredYear = registeredYear;
    car.province = province;
    car.district = district;
    car.price = price;
    car.discount = discount;
    car.description = description;
    car.videoUrl = videoUrl;
    car.isOther = isOther;
    car.status = newStatus;
    car.submittedAt = new Date();
    car.attachments = attachments;

    car.totalPrice = price;
    if (discount) {
      car.totalPrice = price - discount;
    }

    if (
      car.status === CarStatus.DRAFT ||
      car.status === CarStatus.PENDING_APPROVAL
    ) {
      if (willHaveCMUCertified !== car.willHaveCMUCertified) {
        if (willHaveCMUCertified) {
          await this.deductUserBalance(
            ProductPriceType.CARSMEUP_CERTIFIED,
            user,
          );
        } else {
          await this.addUserBalance(
            ProductPriceType.CARSMEUP_CERTIFIED,
            user.id,
            1,
          );
        }
      }
      if (willHaveBump !== car.willHaveBump) {
        if (willHaveBump) {
          await this.deductUserBalance(ProductPriceType.BUMP, user);
        } else {
          await this.addUserBalance(ProductPriceType.BUMP, user.id, 1);
        }
      }
      if (willHaveHotDeal !== car.willHaveHotDeal) {
        if (willHaveHotDeal) {
          await this.deductUserBalance(ProductPriceType.HOT_DEAL, user);
        } else {
          await this.addUserBalance(ProductPriceType.HOT_DEAL, user.id, 1);
        }
      }
      car.willHaveCMUCertified = willHaveCMUCertified;
      car.willHaveBump = willHaveBump;
      car.willHaveHotDeal = willHaveHotDeal;
    }

    const carResult = await this.carRepository.save(car);

    if (brandName || subModelName || modelName || price || manufacturedYear)
      await this.updateCarDataToFirebase(id);

    return carResult;
  }

  async updateByStaff(id: number, dto: UpdateCarByStaffDto, staff: Staff) {
    let shouldSendCMUActivationEmail = false;
    const car = await this.carRepository.findOne({
      where: { id: id },
      relations: {
        user: true,
        publishedBy: true,
        attachments: true,
        cmuCertifiedRequest: true,
      },
    });

    if (!car) {
      throw new NotFoundException(`Car ${id} not found`);
    }

    if (car.status === CarStatus.EXPIRED || car.status === CarStatus.DELETED) {
      throw new BadRequestException('Car status is not ready to be updated');
    }

    const {
      brandName,
      modelName,
      manufacturedYear,
      subModelName,
      transmissionName,
      bodyTypeName,
      engineName,
      fuelTypeName,
      lifestyleName,
      status,
      color,
      otherColor,
      mileage,
      plateNumber,
      gasInstallation,
      registeredYear,
      ownership,
      price,
      discount,
      description,
      province,
      district,
      videoUrl,
      equipmentList,
      attachments,
      reason,
    } = dto;

    let transmission = await this.carTransmissionRepository.findOne({
      where: { name: transmissionName },
    });

    let fuelType = await this.carFuelTypeRepository.findOne({
      where: { name: fuelTypeName },
    });

    let bodyType = await this.carBodyTypeRepository.findOne({
      where: { name: bodyTypeName },
    });

    let engine = await this.carEngineRepository.findOne({
      where: { name: engineName },
    });

    let lifestyle = await this.carLifestyleRepository.findOne({
      where: { name: lifestyleName },
    });

    if (
      car.status !== CarStatus.PUBLISHED &&
      status === CarStatus.PUBLISHED &&
      car.isCurrentVersion
    ) {
      await this.canPublish(car, false);

      car.publishedAt = new Date();
      car.publishedBy = staff;
    }

    car.status = this.getCarNewStatus(car.status, status, staff);

    if (
      car.status === CarStatus.ACTION_REQUIRED ||
      car.status === CarStatus.NEED_ACTION ||
      car.status === CarStatus.NOT_APPROVED
    ) {
      car.reason = reason;
    }

    if (car.status === CarStatus.NOT_APPROVED) {
      car.rejectedAt = new Date();
      car.rejectedBy = staff;
      await this.restoreUserBalance(car);
      car.willHaveBump = false;
      car.willHaveHotDeal = false;
      car.willHaveCMUCertified = false;
    }

    // Roles:
    // =========================================================
    // 1. Staff can update only transmission, fuelType, bodyType,
    // engine, and lifestyle. when isOther = false.
    //
    // 2. Staff can update brand, model, sub model,
    // and manufactured year when isOther = true.
    car.updatedByStaff = staff;
    car.updatedByUser = null;

    if (car.isOther) {
      let brand = await this.carBrandRepository.findOne({
        where: { name: brandName },
      });

      let model = await this.carModelRepository.findOne({
        where: { name: modelName },
      });

      const year = await this.carYearRepository.findOne({
        where: { name: manufacturedYear },
      });

      let subModel = await this.carSubModelRepository.findOne({
        where: { name: subModelName, years: { name: manufacturedYear } },
      });

      if (!brand) {
        brand = this.carBrandRepository.create({
          name: brandName,
          displayable: false,
        });

        brand = await this.carBrandRepository.save(brand);
      }

      if (!model) {
        model = this.carModelRepository.create({
          name: modelName,
          displayable: false,
          brand: brand,
        });

        model = await this.carModelRepository.save(model);
      }

      if (!subModel) {
        subModel = this.carSubModelRepository.create({
          name: subModelName,
          displayable: false,
          model: model,
        });

        subModel.years = [year];
        subModel = await this.carSubModelRepository.save(subModel);
      }

      if (!transmission) {
        transmission = this.carTransmissionRepository.create({
          name: transmissionName,
          displayable: false,
        });

        transmission = await this.carTransmissionRepository.save(transmission);
      }

      if (!fuelType) {
        fuelType = this.carFuelTypeRepository.create({
          name: fuelTypeName,
          displayable: false,
        });

        fuelType = await this.carFuelTypeRepository.save(fuelType);
      }

      if (!bodyType) {
        bodyType = this.carBodyTypeRepository.create({
          name: bodyTypeName,
          displayable: false,
        });

        bodyType = await this.carBodyTypeRepository.save(bodyType);
      }

      if (!engine) {
        engine = this.carEngineRepository.create({
          name: engineName,
          displayable: false,
        });

        engine = await this.carEngineRepository.save(engine);
      }

      if (!lifestyle) {
        lifestyle = this.carLifestyleRepository.create({
          name: lifestyleName,
          displayable: false,
        });

        lifestyle = await this.carLifestyleRepository.save(lifestyle);
      }

      car.brand = brand;
      car.model = model;
      car.subModel = subModel;
      car.manufacturedYear = manufacturedYear;
      car.isOther = false;
    } else {
      if (!transmission) {
        throw new NotFoundException(
          `Transmission ${transmissionName} not found`,
        );
      }

      if (!fuelType) {
        throw new NotFoundException(`Fuel type ${fuelTypeName} not found`);
      }

      if (!bodyType) {
        throw new NotFoundException(`Body type ${bodyTypeName} not found`);
      }

      if (!engine) {
        throw new NotFoundException(`Engine ${engineName} not found`);
      }

      if (!lifestyle) {
        throw new NotFoundException(`Lifestyle ${lifestyleName} not found`);
      }
    }

    car.transmission = transmission;
    car.fuelType = fuelType;
    car.bodyType = bodyType;
    car.engine = engine;
    car.lifestyle = lifestyle;
    car.ownership = ownership;
    car.color = color;
    car.otherColor = otherColor;
    car.mileage = mileage;
    car.plateNumber = plateNumber;
    car.gasInstallation = gasInstallation;
    car.registeredYear = registeredYear;
    car.province = province;
    car.district = district;
    car.price = price;
    car.discount = discount;
    car.description = description;
    car.videoUrl = videoUrl;
    car.equipments = await this.createEquipments(equipmentList);
    car.attachments = attachments;
    car.totalPrice = price;
    if (discount) {
      car.totalPrice = price - discount;
    }

    await this.carRepository.save(car);

    let cmuRequest = car.cmuCertifiedRequest;
    if (car.isCurrentVersion) {
      if (car.status === CarStatus.PUBLISHED) {
        if (car.willHaveBump) {
          car.bumpedAt = new Date();
          car.willHaveBump = false;
          car.isBumped = true;
        }

        if (car.willHaveHotDeal) {
          car.hotDealedAt = new Date();
          car.willHaveHotDeal = false;
          car.isHotDealed = true;
        }

        if (car.willHaveCMUCertified) {
          cmuRequest = this.cmuCertifiedRequestRepository.create({
            car: car,
            requestedBy: car.user,
            status: CmuCertifiedRequestStatus.WAITING_APPROVAL,
            voucher: {
              voucherType: VoucherType.CARSMEUP_CERTIFIED,
              status: VoucherStatus.ACTIVATED,
              activatedAt: new Date(),
              user: car.user,
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
                ownerFirstName: car.user.firstName,
                ownerLastName: car.user.lastName,
                ownerPhoneNumber: car.user.phoneNumber,
                ownerFullName: [car.user.firstName, car.user.lastName].join(
                  ' ',
                ),
                ownerEmail: car.user.email,
              },
            },
          });

          cmuRequest = await this.cmuCertifiedRequestRepository.save(
            cmuRequest,
          );

          car.cmuCertifiedRequest = cmuRequest;
          car.willHaveCMUCertified = false;
          shouldSendCMUActivationEmail = true;
        }
      }
    } else {
      if (
        car.status === CarStatus.PUBLISHED ||
        car.status === CarStatus.NOT_APPROVED ||
        car.status === CarStatus.NEED_ACTION
      ) {
        const currentVersion = await this.carRepository.findOne({
          where: { newVersion: { id: car.id } },
        });

        if (car.willHaveBump) {
          currentVersion.bumpedAt = new Date();
          currentVersion.willHaveBump = false;
          currentVersion.isBumped = true;
        }

        if (car.willHaveHotDeal) {
          currentVersion.hotDealedAt = new Date();
          currentVersion.willHaveHotDeal = false;
          currentVersion.isHotDealed = true;
        }

        if (car.willHaveCMUCertified) {
          cmuRequest = this.cmuCertifiedRequestRepository.create({
            car: currentVersion,
            requestedBy: car.user,
            voucher: {
              voucherType: VoucherType.CARSMEUP_CERTIFIED,
              status: VoucherStatus.ACTIVATED,
              activatedAt: new Date(),
              user: car.user,
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
                ownerFirstName: car.user.firstName,
                ownerLastName: car.user.lastName,
                ownerPhoneNumber: car.user.phoneNumber,
                ownerFullName: [car.user.firstName, car.user.lastName].join(
                  ' ',
                ),
                ownerEmail: car.user.email,
              },
            },
          });

          cmuRequest = await this.cmuCertifiedRequestRepository.save(
            cmuRequest,
          );

          currentVersion.cmuCertifiedRequest = cmuRequest;
          currentVersion.willHaveCMUCertified = false;
          shouldSendCMUActivationEmail = true;
        }
      }
    }

    await this.carRepository.save(car);

    if (cmuRequest) {
      cmuRequest = await this.cmuCertifiedRequestRepository.findOne({
        where: { id: cmuRequest.id },
        relations: {
          voucher: true,
        },
      });
    }

    if (
      car.status === CarStatus.PUBLISHED &&
      cmuRequest?.voucher &&
      shouldSendCMUActivationEmail
    ) {
      await this.voucherService.sendUserVoucherEmail({
        uid: cmuRequest.voucher.uid,
        isCMUVoucher:
          cmuRequest.voucher.voucherType == VoucherType.CARSMEUP_CERTIFIED,
        voucherId: cmuRequest.voucher.id,
        client: {
          email: car.user.email,
          firstName: car.user.firstName,
          lastName: car.user.lastName,
        },
      });

      await this.voucherService.sendProviderVoucherEmail({
        voucher: {
          uid: cmuRequest.voucher.uid,
          voucherType: VoucherType.CARSMEUP_CERTIFIED,
          activatedAt: new Date(),
        },
        car: {
          brand: car.brandName,
          model: car.modelName,
          plateNumber: car.plateNumber,
          manufacturedYear: car.manufacturedYear,
          subModel: car.subModelName,
        },
        client: {
          firstName: car.user.firstName,
          lastName: car.user.lastName,
          phoneNumber: car.user.phoneNumber,
          email: car.user.email,
        },
      });
    }

    await this.updateCarDataToFirebase(car.id);

    if (
      [
        CarStatus.PUBLISHED,
        CarStatus.NOT_APPROVED,
        CarStatus.ACTION_REQUIRED,
        CarStatus.NEED_ACTION,
      ].includes(car.status)
    ) {
      let carId = car.id;
      if (
        !car.isCurrentVersion &&
        (car.status === CarStatus.PUBLISHED ||
          car.status === CarStatus.NOT_APPROVED)
      ) {
        const currentVersion = await this.carRepository.findOne({
          where: { newVersion: { id: car.id } },
        });
        carId = currentVersion.id;
      }

      await this.notificationsService.createCarNotification({
        userId: car.user.id,
        carId: carId,
        status: car.status,
        carInformation: [car.brandName, car.modelName, car.subModelName].join(
          ' ',
        ),
      });
    }

    if (!car.isCurrentVersion) {
      const currentVersion = await this.carRepository.findOne({
        where: { newVersion: { id: car.id } },
        relations: {
          cmuCertifiedRequest: true,
        },
      });

      currentVersion.transmission = car.transmission;
      currentVersion.fuelType = car.fuelType;
      currentVersion.bodyType = car.bodyType;
      currentVersion.engine = car.engine;
      currentVersion.lifestyle = car.lifestyle;
      currentVersion.ownership = ownership;
      currentVersion.color = color;
      currentVersion.otherColor = otherColor;
      currentVersion.mileage = mileage;
      currentVersion.plateNumber = plateNumber;
      currentVersion.gasInstallation = gasInstallation;
      currentVersion.registeredYear = registeredYear;
      currentVersion.province = province;
      currentVersion.district = district;
      currentVersion.price = price;
      currentVersion.discount = discount;
      currentVersion.description = description;
      currentVersion.videoUrl = videoUrl;
      currentVersion.totalPrice = price;
      if (discount) {
        currentVersion.totalPrice = price - discount;
      }

      if (car.status === CarStatus.PUBLISHED) {
        currentVersion.attachments = car.attachments;
        currentVersion.isUnderRevision = false;

        await this.carRepository.save(currentVersion);

        await this.carRepository.delete(car.id);

        return currentVersion;
      } else if (car.status === CarStatus.NOT_APPROVED) {
        currentVersion.isUnderRevision = false;
        await this.carRepository.save(currentVersion);

        await this.carRepository.delete(car.id);

        return currentVersion;
      } else if (car.status === CarStatus.NEED_ACTION) {
        await this.carRepository.save(currentVersion);
        return currentVersion;
      }
    }

    return car;
  }

  async moveToBin(dto: MoveCarToBinDto, user: User | Staff) {
    const deletedBy = {
      deletedByUser: null,
      deletedByStaff: null,
    };

    if (user instanceof User) {
      deletedBy.deletedByUser = user;
      deletedBy.deletedByStaff = null;
    } else {
      deletedBy.deletedByStaff = user;
      deletedBy.deletedByUser = null;
    }

    for (const carId of dto.ids) {
      const car = await this.carRepository.findOne({ where: { id: carId } });

      if (
        car.status === CarStatus.DRAFT ||
        car.status === CarStatus.PENDING_APPROVAL ||
        car.status === CarStatus.ACTION_REQUIRED
      ) {
        await this.restoreUserBalance(car);
        await this.carRepository.update(
          { id: carId },
          {
            willHaveBump: false,
            willHaveCMUCertified: false,
            willHaveHotDeal: false,
          },
        );
      }
    }
    return await this.carRepository.update(
      { id: In(dto.ids) },
      {
        status: CarStatus.DELETED,
        dumpAt: new Date(),
        ...deletedBy,
      },
    );
  }

  async remove(dto: DeleteCarDto) {
    return await this.carRepository.update(
      {
        id: In(dto.ids),
        status: CarStatus.DELETED,
      },
      {
        deletedAt: new Date(),
      },
    );
  }

  async uploadAttachment(
    file: Express.Multer.File,
    dto: UploadCarAttachmentDto,
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

  async brands(query: QueryBrandDto) {
    const { withModels, sortBy, sortDirection } = query;

    if (withModels) {
      const brands = await this.carBrandRepository
        .createQueryBuilder('brand')
        .leftJoinAndSelect('brand.models', 'models')
        .leftJoinAndSelect('models.subModels', 'subModels')
        .orderBy(`${sortBy}`, sortDirection as 'ASC' | 'DESC')
        .addOrderBy('models.name', sortDirection as 'ASC' | 'DESC')
        .addOrderBy('subModels.name', sortDirection as 'ASC' | 'DESC')
        .getMany();

      return brands.map((brand) => ({
        name: brand.name,
        models: brand.models.map((model) => ({
          name: model.name,
          subModels: model.subModels.map((subModel) => subModel.name),
        })),
      }));
    }

    const brandQuery = this.carBrandRepository
      .createQueryBuilder('brand')
      .select('brand.name', 'name');

    brandQuery.orderBy(`${sortBy}`, sortDirection as 'ASC' | 'DESC');

    const brands = await brandQuery.getRawMany();

    return brands.map((brand) => brand.name);
  }

  async models(query: QueryModelDto) {
    const { brandName, sortBy, sortDirection } = query;

    const modelQuery = this.carModelRepository
      .createQueryBuilder('model')
      .select('model.name', 'name')
      .where('brand_name = :brandName', { brandName });

    modelQuery.orderBy(`${sortBy}`, sortDirection as 'ASC' | 'DESC');

    const models = await modelQuery.getRawMany();

    return models.map((model) => model.name);
  }

  async years(query: QueryYearDto) {
    const { sortBy, sortDirection } = query;

    const yearQuery = this.carYearRepository
      .createQueryBuilder('year')
      .select('year.name', 'name');

    yearQuery.orderBy(`${sortBy}`, sortDirection as 'ASC' | 'DESC');

    const years = await yearQuery.getRawMany();

    return years.map((year) => year.name);
  }

  async subModels(query: QuerySubModelDto) {
    const { modelName, manufacturedYear, sortBy, sortDirection } = query;

    const subModelQuery = this.carSubModelRepository
      .createQueryBuilder('subModel')
      .select('subModel.name', 'name')
      .leftJoin('subModel.years', 'years')
      .where('subModel.model_name = :modelName', { modelName })
      .andWhere('years.name = :manufacturedYear', { manufacturedYear });

    subModelQuery.orderBy(`${sortBy}`, sortDirection as 'ASC' | 'DESC');

    const subModels = await subModelQuery.getRawMany();

    return subModels.map((subModel) => subModel.name);
  }

  async transmissions(query: QueryTransmissionDto) {
    const { sortBy, sortDirection } = query;

    const transmissionQuery = this.carTransmissionRepository
      .createQueryBuilder('transmission')
      .select('transmission.name', 'name');

    transmissionQuery.orderBy(`${sortBy}`, sortDirection as 'ASC' | 'DESC');

    const transmissions = await transmissionQuery.getRawMany();

    return transmissions.map((transmission) => transmission.name);
  }

  async fuelTypes(query: QueryFuelTypeDto) {
    const { subModelName, sortBy, sortDirection } = query;

    const fuelTypeQuery = this.carFuelTypeRepository
      .createQueryBuilder('fuelType')
      .select('fuelType.name', 'name');

    if (subModelName) {
      fuelTypeQuery
        .leftJoin('fuelType.subModels', 'subModels')
        .where('subModels.name = :subModelName', { subModelName });
    }

    fuelTypeQuery.orderBy(`${sortBy}`, sortDirection as 'ASC' | 'DESC');

    const fuelTypes = await fuelTypeQuery.getRawMany();

    return fuelTypes.map((fuelType) => fuelType.name);
  }

  async bodyTypes(query: QueryBodyTypeDto) {
    const { subModelName, sortBy, sortDirection } = query;

    const bodyTypeQuery = this.carBodyTypeRepository
      .createQueryBuilder('bodyType')
      .select('bodyType.name', 'name');

    if (subModelName) {
      bodyTypeQuery
        .leftJoin('bodyType.subModels', 'subModels')
        .where('subModels.name = :subModelName', { subModelName });
    }

    bodyTypeQuery.orderBy(`${sortBy}`, sortDirection as 'ASC' | 'DESC');

    const bodyTypes = await bodyTypeQuery.getRawMany();

    return bodyTypes.map((bodyType) => bodyType.name);
  }

  async engines(query: QueryEngineDto) {
    const { subModelName, sortBy, sortDirection } = query;

    const engineQuery = this.carEngineRepository
      .createQueryBuilder('engine')
      .select('engine.name', 'name');

    if (subModelName) {
      engineQuery
        .leftJoin('engine.subModels', 'subModels')
        .where('subModels.name = :subModelName', { subModelName });
    }

    engineQuery.orderBy(
      `REGEXP_REPLACE(${sortBy}, ',', '', 'g')::INT`,
      sortDirection as 'ASC' | 'DESC',
    );

    const engines = await engineQuery.getRawMany();

    return engines.map((engine) => engine.name);
  }

  async lifestyles(query: QueryLifestyleDto) {
    const { modelName, sortBy, sortDirection } = query;

    const lifestyleQuery = this.carLifestyleRepository
      .createQueryBuilder('lifestyle')
      .select('lifestyle.name', 'name');

    if (modelName) {
      lifestyleQuery
        .leftJoin('lifestyle.models', 'models')
        .where('models.name = :modelName', { modelName });
    }

    lifestyleQuery.orderBy(`${sortBy}`, sortDirection as 'ASC' | 'DESC');

    const lifestyles = await lifestyleQuery.getRawMany();

    return lifestyles.map((lifestyle) => lifestyle.name);
  }

  async equipments(query: QueryEquipmentDto) {
    const { search, sortBy, sortDirection } = query;

    const equipmentQuery = this.carEquipmentRepository
      .createQueryBuilder('equipment')
      .select('equipment.name', 'name');

    if (search) {
      equipmentQuery.andWhere(`(equipment.name ILIKE :search)`, {
        search: `%${search}%`,
      });
    }

    equipmentQuery.orderBy(`${sortBy}`, sortDirection as 'ASC' | 'DESC');

    const equipments = await equipmentQuery.getRawMany();

    return equipments.map((equipment) => equipment.name);
  }

  async publish(id: number, staff: Staff) {
    const car = await this.carRepository.findOne({
      where: { id: id },
      relations: {
        user: true,
      },
    });

    if (!car) {
      throw new NotFoundException(`Car ${id} not found`);
    }

    if (
      car.status !== CarStatus.PENDING_APPROVAL &&
      car.status !== CarStatus.PENDING_EDIT_APPROVAL
    ) {
      throw new BadRequestException(`Car status is not ready to be published`);
    }

    await this.canPublish(car);

    car.status = CarStatus.PUBLISHED;
    car.publishedBy = staff;
    car.publishedAt = new Date();

    return await this.carRepository.save(car);
  }

  async unpublish(id: number) {
    const car = await this.carRepository.findOne({ where: { id: id } });

    if (!car) {
      throw new NotFoundException(`Car ${id} not found`);
    }

    if (
      car.status !== CarStatus.PUBLISHED &&
      car.status !== CarStatus.PENDING_EDIT_APPROVAL &&
      car.status !== CarStatus.NEED_ACTION
    ) {
      throw new BadRequestException(
        `Car status is not ready to be unpublished`,
      );
    }

    car.status = CarStatus.DRAFT;
    car.publishedAt = null;
    car.publishedBy = null;

    await this.saveCarRepository.delete({ carId: id });

    return await this.carRepository.save(car);
  }

  async republish(id: number) {
    const car = await this.carRepository.findOne({
      where: { id: id },
      relations: {
        user: true,
      },
    });

    if (!car) {
      throw new NotFoundException(`Car ${id} not found`);
    }

    if (car.status !== CarStatus.EXPIRED) {
      throw new BadRequestException(
        `Car status is not ready to be republished`,
      );
    }

    await this.canPublish(car);

    car.status = CarStatus.PUBLISHED;
    car.publishedAt = new Date();
    car.expiredAt = null;

    return await this.carRepository.save(car);
  }

  async reject(id: number, dto: RejectCarDto, staff: Staff) {
    const car = await this.carRepository.findOne({ where: { id: id } });

    if (!car) {
      throw new NotFoundException(`Car ${id} not found`);
    }

    if (
      car.status !== CarStatus.PENDING_APPROVAL &&
      car.status !== CarStatus.PENDING_EDIT_APPROVAL
    ) {
      throw new BadRequestException(`Car status is not ready to be rejected`);
    }

    car.status = CarStatus.NOT_APPROVED;
    car.rejectedAt = new Date();
    car.rejectedBy = staff;
    car.reason = dto.reason;

    return await this.carRepository.save(car);
  }

  async reserve(id: number) {
    const car = await this.carRepository.findOne({ where: { id: id } });

    if (!car) {
      throw new NotFoundException(`Car ${id} not found`);
    }

    if (
      car.status !== CarStatus.PUBLISHED &&
      car.status !== CarStatus.PENDING_EDIT_APPROVAL &&
      car.status !== CarStatus.NEED_ACTION &&
      car.status !== CarStatus.EXPIRED
    ) {
      throw new BadRequestException(`Car status is not ready to be reserved`);
    }

    car.status = CarStatus.RESERVED;
    car.reservedAt = new Date();

    return await this.carRepository.save(car);
  }

  async unreserve(id: number) {
    const car = await this.carRepository.findOne({ where: { id: id } });

    if (!car) {
      throw new NotFoundException(`Car ${id} not found`);
    }

    if (car.status !== CarStatus.RESERVED) {
      throw new BadRequestException(`Car status is not ready to be unreserved`);
    }

    car.status = CarStatus.PUBLISHED;
    car.reservedAt = null;

    return await this.carRepository.save(car);
  }

  async sell(id: number, dto: SellCarDto) {
    const car = await this.carRepository.findOne({ where: { id: id } });

    if (!car) {
      throw new NotFoundException(`Car ${id} not found`);
    }

    if (
      car.status !== CarStatus.PUBLISHED &&
      car.status !== CarStatus.RESERVED &&
      car.status !== CarStatus.PENDING_EDIT_APPROVAL &&
      car.status !== CarStatus.NEED_ACTION &&
      car.status !== CarStatus.EXPIRED
    ) {
      throw new BadRequestException(`Car status is not ready to be sold`);
    }

    car.status = CarStatus.SOLD_OUT;
    car.soldAt = new Date();
    car.soldOn = dto.soldOn;
    car.soldOnOther = dto.soldOnOther;

    return await this.carRepository.save(car);
  }

  async recover(id: number) {
    const car = await this.carRepository.findOne({ where: { id: id } });

    if (!car) {
      throw new NotFoundException(`Car ${id} not found`);
    }

    if (car.status !== CarStatus.DELETED) {
      throw new BadRequestException(`Car status is not ready to be deleted`);
    }

    car.status = CarStatus.DRAFT;
    car.dumpAt = null;

    return await this.carRepository.save(car);
  }

  async pending(id: number) {
    const car = await this.carRepository.findOne({ where: { id: id } });

    if (!car) {
      throw new NotFoundException(`Car ${id} not found`);
    }

    if (car.status !== CarStatus.DRAFT) {
      throw new BadRequestException(`Car status is not ready to be reviewed`);
    }

    car.status = CarStatus.PENDING_APPROVAL;
    car.submittedAt = new Date();

    return await this.carRepository.save(car);
  }

  async cancel(id: number) {
    const car = await this.carRepository.findOne({
      where: { id: id },
    });

    if (!car) {
      throw new NotFoundException(`Car ${id} not found`);
    }

    if (
      car.status !== CarStatus.PENDING_APPROVAL &&
      car.status !== CarStatus.ACTION_REQUIRED &&
      car.status !== CarStatus.PENDING_EDIT_APPROVAL &&
      car.status !== CarStatus.NEED_ACTION
    ) {
      throw new BadRequestException(`Car status is not ready to be canceled`);
    }

    if (car.status !== CarStatus.PENDING_APPROVAL) {
      await this.restoreUserBalance(car);
    }

    if (!car.isCurrentVersion) {
      const currentVersion = await this.carRepository.findOne({
        where: { newVersion: { id: car.id } },
      });

      currentVersion.isUnderRevision = false;

      await this.carRepository.delete(car.id);

      return await this.carRepository.save(currentVersion);
    }

    car.status = CarStatus.DRAFT;
    car.submittedAt = null;

    return await this.carRepository.save(car);
  }

  async applyHotDeals(dto: ApplyHotDealDto, currentUserId: number) {
    const user = await this.userRepository.findOne({
      where: { id: currentUserId },
    });

    if (!user) {
      throw new NotFoundException(`User ${currentUserId} not found`);
    }

    const { carIds } = dto;

    if (user.hotDealBalance < dto.carIds.length) {
      throw new BadRequestException(
        `User id #${currentUserId} does not have enough hot deal balance`,
      );
    }

    const appliedCars = [];
    for (const id of carIds) {
      const car = await this.carRepository.findOne({
        where: { id: id },
        relations: {
          user: true,
        },
      });

      if (!car) {
        throw new NotFoundException(`Car ${id} not found`);
      }

      if (![CarStatus.PUBLISHED, CarStatus.RESERVED].includes(car.status)) {
        throw new BadRequestException(
          `Car status is not ready to be hot dealed`,
        );
      }

      if (!car.isHotDealed) {
        appliedCars.push(
          await this.activateProduct(ProductPriceType.HOT_DEAL, car),
        );
      }
    }

    return appliedCars;
  }

  async applyBumps(dto: ApplyBumpDto, currentUserId: number) {
    const user = await this.userRepository.findOne({
      where: { id: currentUserId },
    });

    if (!user) {
      throw new NotFoundException(`User ${currentUserId} not found`);
    }

    const { carIds } = dto;

    if (user.bumpBalance < dto.carIds.length) {
      throw new BadRequestException(
        `User id #${currentUserId} does not have enough bump balance`,
      );
    }

    const appliedCars = [];
    for (const id of carIds) {
      const car = await this.carRepository.findOne({
        where: { id: id },
        relations: {
          user: true,
        },
      });

      if (!car) {
        throw new NotFoundException(`Car ${id} not found`);
      }

      if (![CarStatus.PUBLISHED, CarStatus.RESERVED].includes(car.status)) {
        throw new BadRequestException(`Car status is not ready to be bumped`);
      }

      appliedCars.push(await this.activateProduct(ProductPriceType.BUMP, car));
    }

    return appliedCars;
  }

  async findSimilarCars(id: number): Promise<Car[]> {
    const car = await this.carRepository.findOne({
      where: { id },
      select: ['id', 'bodyTypeName', 'manufacturedYear', 'price'],
    });

    if (!car) {
      throw new NotFoundException(`Car ${id} not found`);
    }

    const manufacturedYearScale = 2;
    const priceScale = 50000;
    const limit = 20;

    const { bodyTypeName, manufacturedYear, price } = car;

    const lowerPrice = Math.max(price - priceScale, 0);
    const upperPrice = price + priceScale;

    const similarCars = await this.carRepository
      .createQueryBuilder('car')
      .leftJoinAndSelect(
        'car.attachments',
        'attachments',
        'attachments.attachmentType = :attachmentType',
        { attachmentType: AttachmentType.EXTERIOR },
      )
      .where({
        status: In([CarStatus.PUBLISHED, CarStatus.RESERVED]),
        bodyTypeName,
        manufacturedYear,
        price: Between(lowerPrice, upperPrice),
        id: Not(car.id),
      })
      .orderBy({ 'car.price': 'ASC', 'car.createdAt': 'DESC' })
      .limit(limit)
      .getMany();

    if (similarCars.length < limit) {
      const lowerYear = Math.max(manufacturedYear - manufacturedYearScale, 0);
      const upperYear = manufacturedYear + manufacturedYearScale;

      const shortfall = limit - similarCars.length;
      const additionalSimilarCars = await this.findAdditionalSimilarCars({
        bodyTypeName,
        excludeYear: manufacturedYear,
        shortfall,
        boundary: {
          lowerYear,
          upperYear,
          lowerPrice,
          upperPrice,
        },
      });

      similarCars.push(...additionalSimilarCars);
    }

    return similarCars;
  }

  private async findAdditionalSimilarCars(data: IFindAdditionalSimilarCars) {
    const {
      bodyTypeName,
      excludeYear,
      shortfall,
      boundary: { lowerYear, upperYear, lowerPrice, upperPrice },
    } = data;
    return await this.carRepository
      .createQueryBuilder('car')
      .leftJoinAndSelect(
        'car.attachments',
        'attachments',
        'attachments.attachmentType = :attachmentType',
        { attachmentType: AttachmentType.EXTERIOR },
      )
      .where(
        `car.status IN (:...status) and car.manufacturedYear != :excludeYear and
          car.manufacturedYear between :lowerYear and :upperYear and
          car.price between :lowerPrice and :upperPrice and car.bodyTypeName = :bodyTypeName`,
        {
          status: [CarStatus.PUBLISHED, CarStatus.RESERVED],
          excludeYear,
          lowerYear,
          upperYear,
          lowerPrice,
          upperPrice,
          bodyTypeName,
        },
      )
      .orderBy({
        'car.manufacturedYear': 'ASC',
        'car.price': 'ASC',
        'car.createdAt': 'DESC',
      })
      .limit(shortfall)
      .getMany();
  }

  @Cron(CronExpression.EVERY_DAY_AT_1AM, {
    name: 'CheckPublishedCars',
  })
  async checkPublishedCars() {
    if (this.configService.get('mode') === 'development') {
      this.logger.log(
        'CheckPublishedCars job: development env detected, skipping',
      );
      return;
    }

    const publishedDaysLimit = this.configService.get<string>(
      'car.publishedDaysLimit',
    );

    return await this.carRepository
      .createQueryBuilder()
      .update(Car)
      .set({ status: CarStatus.EXPIRED, expiredAt: new Date() })
      .where(
        `TIMEZONE('UTC', NOW()) - publishedAt >= INTERVAL '${publishedDaysLimit} days'`,
      )
      .andWhere('status IN(:...status)', {
        status: [
          CarStatus.PUBLISHED,
          CarStatus.PENDING_EDIT_APPROVAL,
          CarStatus.NEED_ACTION,
          CarStatus.RESERVED,
        ],
      })
      .execute();
  }

  @Cron(CronExpression.EVERY_DAY_AT_1AM, {
    name: 'CheckExpiredCars',
  })
  async checkExpiredCars() {
    if (this.configService.get('mode') === 'development') {
      this.logger.log(
        'CheckExpiredCars job: development env detected, skipping',
      );
      return;
    }

    const expiredDaysLimit = this.configService.get<string>(
      'car.expiredDaysLimit',
    );

    await this.carRepository
      .createQueryBuilder()
      .update(Car)
      .set({ status: CarStatus.DELETED, dumpAt: new Date() })
      .where(
        `TIMEZONE('UTC', NOW()) - expiredAt >= INTERVAL '${expiredDaysLimit} days'`,
      )
      .andWhere('status IN(:...status)', {
        status: [CarStatus.EXPIRED],
      })
      .execute();
  }

  @Cron(CronExpression.EVERY_DAY_AT_1AM, {
    name: 'CheckDeletedCars',
  })
  async checkDeletedCars() {
    if (this.configService.get('mode') === 'development') {
      this.logger.log(
        'CheckDeletedCars job: development env detected, skipping',
      );
      return;
    }

    const deletedDaysLimit = this.configService.get<string>(
      'car.deletedDaysLimit',
    );

    await this.carRepository
      .createQueryBuilder()
      .update(Car)
      .set({ deletedAt: new Date() })
      .where(
        `TIMEZONE('UTC', NOW()) - dumpAt >= INTERVAL '${deletedDaysLimit} days'`,
      )
      .andWhere('status IN(:...status)', {
        status: [CarStatus.DELETED],
      })
      .andWhere('deletedAt IS NULL')
      .execute();
  }

  @Cron(CronExpression.EVERY_HOUR, {
    name: 'CheckHotDealExpiredCars',
  })
  async checkHotDealExpiredCars() {
    if (this.configService.get('mode') === 'development') {
      this.logger.log(
        'CheckHotDealExpiredCars job: development env detected, skipping',
      );
      return;
    }

    const hotDealedDaysLimit = this.configService.get<string>(
      'car.hotDealedDaysLimit',
    );

    await this.carRepository
      .createQueryBuilder()
      .update(Car)
      .set({ hotDealedAt: null, isHotDealed: false })
      .where(
        `TIMEZONE('UTC', NOW()) - hotDealedAt >= INTERVAL '${hotDealedDaysLimit} days'`,
      )
      .execute();
  }

  // NOTE: every hour between 21:00 to 23:00 pm and from 0:00 5:00 am
  // @Cron('0 21-23,0-5 * * *', {
  //   name: 'checkCar4sureCars',
  // })
  @Cron(CronExpression.EVERY_HOUR, {
    name: 'checkCar4sureCars',
  })
  async car4sure() {
    if (this.configService.get('mode') === 'development') {
      this.logger.log('Car4sure job: development env detected, skipping');
      return;
    }

    const data = await this.car4sureService.processPostList();

    const successfulPostIds = [];
    if (!isEmpty(data)) {
      for (const [car4sureId, dealerDetails] of Object.entries(data)) {
        let dealer = await this.userRepository.findOne({
          where: { email: dealerDetails.email },
        });

        if (!dealer) {
          const uploadedFile = await this.s3FileService.imageUploadFromUrl({
            url: dealerDetails.profileImageUrl,
            dir: 'images/users',
          });

          if (uploadedFile) {
            dealer = this.userRepository.create({
              role: UserRole.DEALER,
              status: UserStatus.INVITED,
              firstName: dealerDetails.firstName,
              lastName: dealerDetails.lastName,
              email: dealerDetails.email,
              dealerName: dealerDetails.dealerName,
              lineId: dealerDetails.lineId,
              phoneNumber: dealerDetails.phoneNumber,
              province: dealerDetails.province,
              district: dealerDetails.district,
              zipCode: dealerDetails.zipcode,
              profileImageUrl: uploadedFile.location,
              car4sureId: car4sureId,
              isMigrated: true,
            });
          }

          const stripeCustomerId = await this.stripeService.createCustomer(
            `${dealer.firstName} ${dealer.lastName}`,
            dealer.email,
            { role: dealer.role },
          );

          dealer.stripeId = stripeCustomerId;

          this.logger.log('Car4sure job: Creating a new dealer');
          dealer = await this.userRepository.save(dealer);
        } else {
          this.logger.log('Car4sure job: Dealer exists, skipping');
        }

        if (!isEmpty(dealerDetails.cars)) {
          for (const [car4sureCarId, carDetails] of Object.entries(
            dealerDetails.cars,
          )) {
            if (!carDetails.subModelName) {
              successfulPostIds.push(car4sureCarId);
            }

            let car = await this.carRepository.findOne({
              where: { car4sureId: car4sureCarId },
            });

            let transmission = await this.carTransmissionRepository.findOne({
              where: { name: carDetails.transmissionName },
            });

            if (!transmission) {
              transmission = this.carTransmissionRepository.create({
                name: carDetails.transmissionName,
              });

              transmission = await this.carTransmissionRepository.save(
                transmission,
              );
            }

            let fuelType = await this.carFuelTypeRepository.findOne({
              where: { name: carDetails.fuelTypeName },
            });

            if (!fuelType) {
              fuelType = this.carFuelTypeRepository.create({
                name: carDetails.fuelTypeName,
              });

              fuelType = await this.carFuelTypeRepository.save(fuelType);
            }

            let bodyType = await this.carBodyTypeRepository.findOne({
              where: { name: carDetails.bodyTypeName },
            });

            if (!bodyType) {
              bodyType = this.carBodyTypeRepository.create({
                name: carDetails.bodyTypeName,
              });

              bodyType = await this.carBodyTypeRepository.save(bodyType);
            }

            let engine = await this.carEngineRepository.findOne({
              where: { name: carDetails.engineName },
            });

            if (!engine) {
              engine = this.carEngineRepository.create({
                name: carDetails.engineName,
              });

              engine = await this.carEngineRepository.save(engine);
            }

            const status =
              carDetails.totalPrice <= 100000
                ? CarStatus.DRAFT
                : CarStatus.PUBLISHED;

            if (!car) {
              let brand = await this.carBrandRepository.findOne({
                where: { name: carDetails.brandName },
              });

              if (!brand) {
                brand = this.carBrandRepository.create({
                  name: carDetails.brandName,
                });

                brand = await this.carBrandRepository.save(brand);
              }

              let model = await this.carModelRepository.findOne({
                where: { name: carDetails.modelName },
              });

              if (!model) {
                model = this.carModelRepository.create({
                  name: carDetails.modelName,
                  brand: brand,
                  lifestyles: [{ name: 'Others' }],
                });

                model = await this.carModelRepository.save(model);
              }

              const year = await this.carYearRepository.findOne({
                where: { name: carDetails.manufacturedYear },
              });

              let subModel = await this.carSubModelRepository.findOne({
                where: {
                  name: carDetails.subModelName,
                  model: { name: carDetails.modelName },
                  years: { name: carDetails.manufacturedYear },
                },
              });

              if (!subModel) {
                subModel = this.carSubModelRepository.create({
                  name: carDetails.subModelName,
                  model: model,
                });

                subModel.years = [year];
                subModel.fuelTypes = [fuelType];
                subModel.bodyTypes = [bodyType];
                subModel.engines = [engine];
                subModel = await this.carSubModelRepository.save(subModel);
              }

              const lifestyle = await this.carLifestyleRepository.findOne({
                where: { name: 'Others' },
              });

              const attachments = [];
              if (!isEmpty(carDetails.imageUrls)) {
                for (let i = 0; i <= carDetails.imageUrls.length; ++i) {
                  const attachmentType =
                    i < 10 ? AttachmentType.EXTERIOR : AttachmentType.OTHER;

                  const uploadedFile =
                    await this.s3FileService.imageUploadFromUrl({
                      url: carDetails.imageUrls[i],
                      dir: `attachments/${attachmentType}`,
                      isResize: true,
                    });

                  if (uploadedFile) {
                    const attachment = this.attachmentRepository.create({
                      filename: filenameBuffer(uploadedFile.originalname),
                      extension: extname(uploadedFile.originalname).slice(1),
                      size: uploadedFile.size,
                      url: uploadedFile.location,
                      attachmentType: attachmentType,
                    });
                    attachments.push(attachment);
                  }
                }
              }

              car = this.carRepository.create({
                status: status,
                brand: brand,
                model: model,
                subModel: subModel,
                bodyType: bodyType,
                fuelType: fuelType,
                engine: engine,
                transmission: transmission,
                lifestyle: lifestyle,

                mileage: carDetails.mileage,
                manufacturedYear: carDetails.manufacturedYear,
                registeredYear: carDetails.manufacturedYear,
                plateNumber: carDetails.plateNumber,

                price: carDetails.price,
                discount: carDetails.discount,
                totalPrice: carDetails.totalPrice,

                province: carDetails.province,
                district: carDetails.district,

                color: carDetails.color,
                description: carDetails.description,

                isMigrated: true,

                submittedAt: new Date(),
                publishedAt: new Date(),

                car4sureId: car4sureCarId,

                user: dealer,
                attachments: attachments,
              });

              this.logger.log('Car4sure job: Creating a new car');

              try {
                car = await this.carRepository.save(car);
                successfulPostIds.push(car4sureCarId);
                this.logger.log('Car4sure job: new car has been created');
              } catch (error) {
                this.logger.error(`Car4sure job: car: ${car.uid}`);
                this.logger.error(
                  `Car4sure job: Failed to create a new car: ${error}`,
                );
                continue;
              }
            } else {
              car.bodyType = bodyType;
              car.fuelType = fuelType;
              car.engine = engine;
              car.transmission = transmission;

              car.mileage = carDetails.mileage;
              car.plateNumber = carDetails.plateNumber;

              car.price = carDetails.price;
              car.discount = carDetails.discount;
              car.totalPrice = carDetails.totalPrice;

              car.province = carDetails.province;

              car.color = carDetails.color;
              car.description = carDetails.description;

              this.logger.log('Car4sure job: Updating an existing car');

              try {
                car = await this.carRepository.save(car);
                successfulPostIds.push(car4sureCarId);
                this.logger.log('Car4sure job: existing car has been updated');
              } catch (error) {
                this.logger.error(`Car4sure job: car: ${car.uid}`);
                this.logger.error(
                  `Car4sure job: Failed to update car: ${error}`,
                );
                continue;
              }
            }
          }
        } else {
          this.logger.log('Car4sure job: Car list is empty, skipping');
        }
      }

      const clearProcessedPosts = this.configService.get<string>(
        'car4sure.clearProcessedPosts',
      );
      this.logger.log(
        `Car4sure job: clearProcessedPosts is ${clearProcessedPosts}`,
      );

      if (clearProcessedPosts === 'true') {
        this.logger.log('Car4sure job: clearing car list');
        this.logger.log(
          `Car4sure job: cars will be cleared from car list ${successfulPostIds.length}`,
        );

        await this.car4sureService.postSuccessful(successfulPostIds);
        await this.car4sureService.postIndexClear();
      }
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_2AM, {
    name: 'checkCarBeforeExpire',
  })
  async checkCarBeforeExpire() {
    if (this.configService.get('mode') === 'development') {
      this.logger.log(
        'CheckCarBeforeExpire job: development env detected, skipping',
      );
      return;
    }

    const publishedDaysLimit = Number(
      this.configService.get<string>('car.publishedDaysLimit'),
    );

    const expiredCars = await this.carRepository
      .createQueryBuilder('car')
      .where(
        `TIMEZONE('UTC', NOW()) - publishedAt >= INTERVAL '${
          publishedDaysLimit - 7
        } days'`,
      )
      .select([
        'car.id',
        'car.brandName',
        'car.modelName',
        'car.subModelName',
        'car.publishedAt',
        'car.userId',
      ])
      .getMany();

    if (!isEmpty(expiredCars)) {
      for (const car of expiredCars) {
        const { id, userId, brandName, modelName, subModelName, publishedAt } =
          car;
        await this.notificationsService.createExpiredCarNotification({
          carId: id,
          userId,
          carInformation: [brandName, modelName, subModelName].join(' '),
          expiredAt: DateTime.fromJSDate(publishedAt)
            .plus({
              days: publishedDaysLimit,
            })
            .toJSDate(),
        });
      }
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_2AM, {
    name: 'checkCarBeforeDeleted',
  })
  async checkCarBeforeDeleted() {
    if (this.configService.get('mode') === 'development') {
      this.logger.log(
        'CheckCarBeforeDeleted job: development env detected, skipping',
      );
      return;
    }

    const deletedDaysLimit = this.configService.get<string>(
      'car.deletedDaysLimit',
    );

    const deletedCars = await this.carRepository
      .createQueryBuilder('car')
      .where(
        `TIMEZONE('UTC', NOW() + interval '${deletedDaysLimit} days') >= car.dumpAt`,
      )
      .select([
        'car.id',
        'car.brandName',
        'car.modelName',
        'car.subModelName',
        'car.dumpAt',
        'car.userId',
      ])
      .getMany();

    if (!isEmpty(deletedCars)) {
      for (const car of deletedCars) {
        const { id, userId, brandName, modelName, subModelName, dumpAt } = car;

        await this.notificationsService.createDeletedCarNotification({
          carId: id,
          userId,
          carInformation: [brandName, modelName, subModelName].join(' '),
          dumpAt,
        });
      }
    }
  }

  async monthlyInstallment(id: number, query: QueryMonthlyInstallmentDto) {
    const car = await this.carRepository.findOne({ where: { id: id } });

    if (!car) {
      throw new NotFoundException(`Car ${id} not found`);
    }

    const { downPayment } = query;

    // NOTE(Hussein): We have only interest rates for Sedan & Pickup body types
    // Use Sedan interest rates for every car that isn't of Sedan body type.

    let bodyTypeName = car.bodyTypeName;

    if (bodyTypeName !== 'Pickup') {
      bodyTypeName = 'Sedan';
    }

    const monthlyInstallments = await this.monthlyInstallmentRepository.find({
      where: {
        year: car.registeredYear,
        bodyType: { name: bodyTypeName },
      },
    });

    const loanAmount = car.price - car.discount - downPayment;
    return monthlyInstallments.map((monthlyInstallment) => ({
      ...monthlyInstallment,
      loanAmount,
      monthlyInstallment: calculateMonthlyInstallment(
        car.price,
        car.discount,
        downPayment,
        monthlyInstallment.loanTerm,
        monthlyInstallment.interestRate,
      ),
    }));
  }

  async marketprices(query: QueryMarketpriceDto) {
    const { subModelName, manufacturedYear } = query;
    const marketprices = await this.carMarketpriceRepository
      .createQueryBuilder('marketprice')
      .select('ROUND(AVG(marketprice.price), 2)', 'averagePrice')
      .where('marketprice.subModel = :subModel', { subModel: subModelName })
      .andWhere('marketprice.manufacturedYear = :manufacturedYear', {
        manufacturedYear: manufacturedYear,
      })
      .groupBy('marketprice.price')
      .orderBy('marketprice.price', 'ASC')
      .getRawOne();

    if (!marketprices) {
      return {
        lowestPrice: 0,
        highestPrice: 0,
        averagePrice: 0,
      };
    }

    return {
      lowestPrice: marketprices.averagePrice * 0.8, // 20% discount
      highestPrice: marketprices.averagePrice * 0.95, // 5% discount
      averagePrice: marketprices.averagePrice * 0.88, // 12% discount
    };
  }

  private getCarNewStatus(
    currentStatus: CarStatus,
    newStatus: CarStatus,
    updater: User | Staff,
    hasModifiedAttachments = false,
  ) {
    if (updater instanceof Staff) {
      switch (currentStatus) {
        case CarStatus.DRAFT: {
          if (newStatus === CarStatus.DRAFT) {
            return CarStatus.DRAFT;
          } else if (newStatus === CarStatus.PUBLISHED) {
            return CarStatus.PUBLISHED;
          }
        }
        case CarStatus.PENDING_APPROVAL: {
          if (newStatus === CarStatus.ACTION_REQUIRED) {
            return CarStatus.ACTION_REQUIRED;
          } else if (newStatus === CarStatus.PUBLISHED) {
            return CarStatus.PUBLISHED;
          } else if (newStatus === CarStatus.NOT_APPROVED) {
            return CarStatus.NOT_APPROVED;
          }
        }
        case CarStatus.ACTION_REQUIRED: {
          if (newStatus === CarStatus.PUBLISHED) {
            return CarStatus.PUBLISHED;
          }
        }
        case CarStatus.PUBLISHED: {
          if (newStatus === CarStatus.PUBLISHED) {
            return CarStatus.PUBLISHED;
          }
        }
        case CarStatus.PENDING_EDIT_APPROVAL: {
          if (newStatus === CarStatus.NEED_ACTION) {
            return CarStatus.NEED_ACTION;
          } else if (newStatus === CarStatus.PUBLISHED) {
            return CarStatus.PUBLISHED;
          } else if (newStatus === CarStatus.NOT_APPROVED) {
            return CarStatus.NOT_APPROVED;
          }
        }
        case CarStatus.NEED_ACTION: {
          if (newStatus === CarStatus.PUBLISHED) {
            return CarStatus.PUBLISHED;
          }
        }
        default:
          throw new BadRequestException(
            `Staff cannot update the status from ${currentStatus} to ${newStatus}`,
          );
      }
    } else {
      switch (currentStatus) {
        case CarStatus.DRAFT: {
          if (newStatus === CarStatus.DRAFT) {
            return CarStatus.DRAFT;
          } else if (newStatus === CarStatus.PENDING_APPROVAL) {
            return CarStatus.PENDING_APPROVAL;
          }
        }
        case CarStatus.ACTION_REQUIRED: {
          if (newStatus === CarStatus.PENDING_APPROVAL) {
            return CarStatus.PENDING_APPROVAL;
          }
        }
        case CarStatus.PUBLISHED: {
          if (newStatus === CarStatus.PENDING_EDIT_APPROVAL) {
            if (hasModifiedAttachments) {
              return CarStatus.PENDING_EDIT_APPROVAL;
            } else {
              return CarStatus.PUBLISHED;
            }
          }
        }
        case CarStatus.NEED_ACTION: {
          if (newStatus === CarStatus.PENDING_EDIT_APPROVAL) {
            return CarStatus.PENDING_EDIT_APPROVAL;
          }
        }
        default:
          throw new BadRequestException(
            `User cannot update the status from ${currentStatus} to ${newStatus}`,
          );
      }
    }
  }

  private async canPublish(car: Car, countSelf = true) {
    const publishedCarCountQuery = this.carRepository
      .createQueryBuilder('car')
      .innerJoin('car.user', 'user')
      .where('car.status IN (:...status)', {
        status: [
          CarStatus.PUBLISHED,
          CarStatus.RESERVED,
          CarStatus.ACTION_REQUIRED,
          CarStatus.PENDING_APPROVAL,
        ],
      })
      .andWhere('user.id = :userId', { userId: car.user.id });

    if (!countSelf) {
      publishedCarCountQuery.andWhere('car.id != :carId', { carId: car.id });
    }

    const publishedCarCount = await publishedCarCountQuery.getCount();

    if (car.user.postLimit <= publishedCarCount) {
      throw new BadRequestException('User has reached the post limit');
    }
  }

  private async createEquipments(equipmentList: string[]) {
    const equipments = [];
    if (!isEmpty(equipmentList)) {
      for (const equipmentName of equipmentList) {
        let equipment = await this.carEquipmentRepository
          .createQueryBuilder('equipment')
          .where('LOWER(equipment.name) = LOWER(:equipmentName)', {
            equipmentName,
          })
          .getOne();

        if (!equipment) {
          equipment = this.carEquipmentRepository.create({
            name: humanize(equipmentName),
          });

          equipment = await this.carEquipmentRepository.save(equipment);
        }
        equipments.push(equipment);
      }
    }

    return equipments;
  }

  private async updateCarDataToFirebase(id: number) {
    const car = await this.carRepository.findOne({
      where: { id },
      select: [
        'id',
        'uid',
        'modelName',
        'brandName',
        'subModelName',
        'manufacturedYear',
        'totalPrice',
        'monthlyInstallment',
      ],
    });
    const image = await this.attachmentRepository.findOne({
      where: {
        car: { id: car.id },
        attachmentType: AttachmentType.EXTERIOR,
      },
      order: { sequence: 'ASC' },
    });
    await this.chatProducer.queueUpUpdateCarJob({
      ...car,
      price: car.totalPrice,
      image: image?.url ?? '-',
    });
  }

  private async activateProduct(
    productType: ProductPriceType,
    car: Car,
  ): Promise<Car> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const carRepository = queryRunner.manager.getRepository(Car);
      const userRepository = queryRunner.manager.getRepository(User);

      const user = await userRepository.findOne({ where: { id: car.user.id } });

      let hotDealBalance = user.hotDealBalance;
      let bumpBalance = user.bumpBalance;
      let carsmeupCertifiedBalance = user.carsmeupCertifiedBalance;

      switch (productType) {
        case ProductPriceType.HOT_DEAL: {
          if (hotDealBalance <= 0) {
            throw new BadRequestException(
              `User id #${car.user.id} does not have enough hot deal balance`,
            );
          }
          car.hotDealedAt = new Date();
          car.isHotDealed = true;
          car.willHaveHotDeal = false;
          hotDealBalance -= 1;
          break;
        }
        case ProductPriceType.BUMP: {
          if (bumpBalance <= 0) {
            throw new BadRequestException(
              `User id #${car.user.id} does not have enough bump balance`,
            );
          }
          car.isBumped = true;
          car.bumpedAt = new Date();
          car.willHaveBump = false;
          bumpBalance -= 1;
          break;
        }
        case ProductPriceType.CARSMEUP_CERTIFIED: {
          if (carsmeupCertifiedBalance <= 0) {
            throw new BadRequestException(
              `User id #${car.user.id} does not have Carsmeup certified balance`,
            );
          }

          carsmeupCertifiedBalance -= 1;
          car.willHaveCMUCertified = false;

          const cmuRequest = this.cmuCertifiedRequestRepository.create({
            car,
            requestedBy: car.user,
            voucher: {
              voucherType: VoucherType.CARSMEUP_CERTIFIED,
              status: VoucherStatus.ACTIVATED,
              activatedAt: new Date(),
              user: car.user,
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
                ownerFirstName: car.user.firstName,
                ownerLastName: car.user.lastName,
                ownerPhoneNumber: car.user.phoneNumber,
                ownerFullName: [car.user.firstName, car.user.lastName].join(
                  ' ',
                ),
                ownerEmail: car.user.email,
              },
            },
          });

          car.cmuCertifiedRequest = cmuRequest;
          break;
        }
      }

      await carRepository.save(car);
      // NOTE(Hussein): To prevent update the password to NULL
      // We do partial update instead of save
      // because the password is not selectable.

      await userRepository.update(
        { id: car.user.id },
        {
          hotDealBalance: hotDealBalance,
          bumpBalance: bumpBalance,
          carsmeupCertifiedBalance: carsmeupCertifiedBalance,
        },
      );

      await queryRunner.commitTransaction();
      return car;
    } catch (err) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  private async deductUserBalance(productType: ProductPriceType, user: User) {
    let updateInput: QueryDeepPartialEntity<User>;

    switch (productType) {
      case ProductPriceType.HOT_DEAL: {
        if (user.hotDealBalance < 0) {
          throw new BadRequestException(
            `User id #${user.id} does not have enough hot deal balance`,
          );
        }

        updateInput = { hotDealBalance: user.hotDealBalance - 1 };
        break;
      }
      case ProductPriceType.BUMP: {
        if (user.bumpBalance < 0) {
          throw new BadRequestException(
            `User id #${user.id} does not have enough bump balance`,
          );
        }

        updateInput = { bumpBalance: user.bumpBalance - 1 };
        break;
      }
      case ProductPriceType.CARSMEUP_CERTIFIED: {
        if (user.carsmeupCertifiedBalance < 0) {
          throw new BadRequestException(
            `User id #${user.id} does not have enough Carsmup certified balance`,
          );
        }

        updateInput = {
          carsmeupCertifiedBalance: user.carsmeupCertifiedBalance - 1,
        };
        break;
      }
    }

    // NOTE(Hussein): To prevent update the password to NULL
    // We do partial update instead of save
    // because the password is not selectable.
    await this.userRepository.update({ id: user.id }, updateInput);
  }

  private async restoreUserBalance(car: Car, amount = 1) {
    const { willHaveBump, willHaveHotDeal, willHaveCMUCertified } = car;
    if (willHaveBump)
      await this.addUserBalance(ProductPriceType.BUMP, car.userId, amount);
    if (willHaveHotDeal)
      await this.addUserBalance(ProductPriceType.HOT_DEAL, car.userId, amount);
    if (willHaveCMUCertified)
      await this.addUserBalance(
        ProductPriceType.CARSMEUP_CERTIFIED,
        car.userId,
        amount,
      );
  }

  private async addUserBalance(
    productType: ProductPriceType,
    userId: number,
    amount: number,
  ) {
    let updateInput: QueryDeepPartialEntity<User>;

    switch (productType) {
      case ProductPriceType.HOT_DEAL: {
        updateInput = { hotDealBalance: () => `hot_deal_balance + ${amount}` };
        break;
      }
      case ProductPriceType.BUMP: {
        updateInput = { bumpBalance: () => `bump_balance + ${amount}` };
        break;
      }
      case ProductPriceType.CARSMEUP_CERTIFIED: {
        updateInput = {
          carsmeupCertifiedBalance: () =>
            `carsmeup_certified_balance + ${amount}`,
        };
        break;
      }
    }

    await this.userRepository.update({ id: userId }, updateInput);
  }

  async applyForLoan(dto: ApplyLoanInformation) {
    const { id, firstName, lastName, url, phoneNumber } = dto;
    const car = await this.carRepository.findOne({
      where: { id },
      relations: { user: true },
    });
    if (!car) throw new NotFoundException(`Car ${id} not found`);

    await this.emailService.sendApplyForLoan(
      firstName,
      lastName,
      url,
      car,
      phoneNumber,
    );
    return { message: 'success' };
  }
}
