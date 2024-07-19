import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';

import { S3FileService } from '@/services';
import { Report } from '@/db/entities/report.entity';
import { User } from '@/db/entities/user.entity';

import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { ReportProducer } from './producers/report.producer';
import { ReportConsumer } from './consumers/report.consumer';
import { PaginationsService } from '../paginations/paginations.service';
import { Car } from '@/db/entities/car.entity';
import { Staff } from '@/db/entities/staff.entity';
import { CarsModule } from '../cars/cars.module';

@Module({
  imports: [
    CarsModule,
    BullModule.registerQueue({
      name: 'report',
    }),
    TypeOrmModule.forFeature([Report, User, Staff, Car]),
  ],
  controllers: [ReportsController],
  providers: [
    ReportsService,
    ReportProducer,
    ReportConsumer,
    S3FileService,
    PaginationsService,
  ],
  exports: [ReportsService, ReportProducer],
})
export class ReportsModule {}
