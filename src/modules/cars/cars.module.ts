import { EmailService } from '@/modules/email/email.service';
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CarSubscriber } from '@/db/subscribers/car.subscriber';
import { User } from '@/db/entities/user.entity';
import { Car } from '@/db/entities/car.entity';

import { CarsService } from './cars.service';
import { CarsController } from './cars.controller';
import { CarBrand } from '@/db/entities/car-brand.entity';
import { CarModel } from '@/db/entities/car-model.entity';
import { CarYear } from '@/db/entities/car-year.entity';
import { CarSubModel } from '@/db/entities/car-sub-model.entity';
import { CarFuelType } from '@/db/entities/car-fuel-type.entity';
import { CarBodyType } from '@/db/entities/car-body-type.entity';
import { CarEngine } from '@/db/entities/car-engine.entity';
import { PaginationsService } from '../paginations/paginations.service';
import { CarTransmission } from '@/db/entities/car-transmission.entity';
import { CarLifestyle } from '@/db/entities/car-lifestyle.entity';
import { CarEquipment } from '@/db/entities/car-equipment.entity';
import { MonthlyInstallment } from '@/db/entities/monthly-installment.entity';
import { Attachment } from '@/db/entities/attachment.entity';
import { Staff } from '@/db/entities/staff.entity';
import { Car4sureService, S3FileService, StripeService } from '@/services';
import { CarMarketprice } from '@/db/entities/car-marketprice.entity';
import { ChatsModule } from '../chats/chats.module';
import { HttpModule } from '@nestjs/axios';
import { CmuCertifiedRequest } from '@/db/entities/cmu-certified-request.entity';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from '../auth/constants';
import { NotificationsModule } from '../notifications/notifications.module';
import { SaveCar } from '@/db/entities/save-car.entity';
import { VouchersModule } from '../vouchers/vouchers.module';
import { VouchersService } from '../vouchers/vouchers.service';

@Module({
  imports: [
    JwtModule.register({
      secret: jwtConstants.secret,
    }),
    HttpModule,
    TypeOrmModule.forFeature([
      User,
      Staff,
      Car,
      CarBrand,
      CarModel,
      CarYear,
      CarSubModel,
      CarFuelType,
      CarBodyType,
      CarEngine,
      CarLifestyle,
      CarTransmission,
      CarEquipment,
      CarMarketprice,
      Attachment,
      MonthlyInstallment,
      CmuCertifiedRequest,
      SaveCar,
    ]),
    forwardRef(() => ChatsModule),
    NotificationsModule,
    VouchersModule,
  ],
  controllers: [CarsController],
  providers: [
    CarsService,
    CarSubscriber,
    PaginationsService,
    S3FileService,
    Car4sureService,
    StripeService,
    EmailService,
  ],
  exports: [CarsService],
})
export class CarsModule {}
