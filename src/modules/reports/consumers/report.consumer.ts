import { Logger, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DateTime } from 'luxon';
import {
  Processor,
  Process,
  OnQueueActive,
  OnQueueCompleted,
  OnQueueFailed,
} from '@nestjs/bull';
import { Job } from 'bull';

import { ReportsService } from '../reports.service';
import { S3FileService } from '@/services';
import { QueryExportCarReportDto } from '../dto';
import {
  carExportHeaders,
  CarExportRow,
  carExportWidths,
} from '../types/cars/car-report.type';
import { Car } from '@/db/entities/car.entity';
import { mapCmuCertifiedStatus } from '@/common/helpers/car.helper';

@Injectable()
@Processor('report')
export class ReportConsumer {
  private readonly logger = new Logger(ReportConsumer.name);

  constructor(
    private readonly s3FileService: S3FileService,
    private readonly reportsService: ReportsService,

    @InjectRepository(Car)
    private readonly carRepository: Repository<Car>,
  ) {}

  @OnQueueActive()
  async onActive(job: Job) {
    await this.reportsService.setJobUid(job.data['reportId'], job.id as string);

    this.logger.log(
      `=====================================================================`,
    );
    this.logger.log(
      `Processing job ${job.id} of type ${job.name} with data ${job.data}...`,
    );
    this.logger.log(
      `=====================================================================`,
    );
  }

  @OnQueueCompleted()
  async onComplete(job: Job) {
    await this.reportsService.moveToDone(job.data['reportId']);

    this.logger.log(
      `====================================================================`,
    );
    this.logger.log(
      `Completed job ${job.id} of type ${job.name} with data ${job.data}...`,
    );
    this.logger.log(
      `====================================================================`,
    );
  }

  @OnQueueFailed()
  async onError(job: Job, error: Error) {
    await this.reportsService.moveToError(job.data['reportId'], error.message);

    this.logger.error(
      `=============================================================================================`,
    );
    this.logger.error(
      `Error job ${job.id} of type ${job.name} with error ${error.message}, and stack ${error.stack}`,
    );
    this.logger.error(
      `=============================================================================================`,
    );
  }

  @Process('car-report')
  async exportCarReport(job: Job<unknown>) {
    const query: QueryExportCarReportDto = job.data['query'];
    const reportId: number = job.data['reportId'];

    const { publishedAtStart, publishedAtEnd } = query;
    const carExportRows: CarExportRow[] = [];

    const carsQuery = this.carRepository
      .createQueryBuilder('car')
      .select([
        'car.id AS "carId"',
        'car.brandName AS "brandName"',
        'car.modelName AS "modelName"',
        'car.subModelName AS "subModelName"',
        'car.manufacturedYear AS "manufacturedYear"',
        'car.transmissionName AS "transmissionName"',
        'car.bodyTypeName AS "bodyTypeName"',
        'car.fuelTypeName AS "fuelTypeName"',
        'car.color AS "color"',
        'car.mileage AS "mileage"',
        'car.totalPrice AS "totalPrice"',
        'car.monthlyInstallment AS "monthlyInstallment"',
        'car.publishedAt AS "publishedAt"',
        'car.userId AS "userId"',
        'car.status AS "status"',
        'car.province AS "province"',
        'car.district AS "district"',
        'car.isHotDealed AS "isHotDealed"',
        'car.isCarsmeupCertified AS "isCarsmeupCertified"',
        'car.isMigrated AS "isMigrated"',
        'car.postOnSocialMedia AS "postOnSocialMedia"',
        'user.uid AS "userUid"',
        'user.firstName AS "userFirstName"',
        'user.lastName AS "userLastName"',
        'user.phoneNumber AS "userPhoneNumber"',
        'user.lineId AS "userLineId"',
        'user.dealerName AS "userDealerName"',
        'user.role AS "userRole"',
        'COALESCE(SUM(clicks.count), 0) AS clicks',
        'COALESCE(SUM(views.count), 0) AS views',
        'COALESCE(SUM(impressions.count), 0) AS impressions',
        'ROUND(AVG(marketprices.price), 2) AS "averagePrice"',
      ])
      .innerJoin('car.user', 'user')
      .leftJoin('car.views', 'views')
      .leftJoin('car.clicks', 'clicks')
      .leftJoin('car.impressions', 'impressions')
      .leftJoin(
        'car_marketprices',
        'marketprices',
        'marketprices.subModel = car.subModelName AND marketprices.manufacturedYear = car.manufacturedYear',
      )
      .where('car.publishedAt IS NOT NULL') // Only export cars who have been published.
      .andWhere('car.isCurrentVersion = true') // Don't export new versions
      .groupBy('car.id')
      .addGroupBy('car.brandName')
      .addGroupBy('car.modelName')
      .addGroupBy('car.subModelName')
      .addGroupBy('car.manufacturedYear')
      .addGroupBy('car.transmissionName')
      .addGroupBy('car.bodyTypeName')
      .addGroupBy('car.fuelTypeName')
      .addGroupBy('car.color')
      .addGroupBy('car.mileage')
      .addGroupBy('car.totalPrice')
      .addGroupBy('car.monthlyInstallment')
      .addGroupBy('car.publishedAt')
      .addGroupBy('car.userId')
      .addGroupBy('car.status')
      .addGroupBy('car.province')
      .addGroupBy('car.district')
      .addGroupBy('car.publishedAt')
      .addGroupBy('car.isHotDealed')
      .addGroupBy('car.isCarsmeupCertified')
      .addGroupBy('car.isMigrated')
      .addGroupBy('car.postOnSocialMedia')
      .addGroupBy('user.id')
      .addGroupBy('user.uid')
      .addGroupBy('user.firstName')
      .addGroupBy('user.lastName')
      .addGroupBy('user.phoneNumber')
      .addGroupBy('user.lineId')
      .addGroupBy('user.dealerName')
      .addGroupBy('user.role')
      .orderBy('car.publishedAt', 'ASC');

    if (publishedAtStart && publishedAtEnd) {
      const startDate = DateTime.fromJSDate(new Date(publishedAtStart)).plus({
        hours: 7,
      });
      const endDate = DateTime.fromJSDate(new Date(publishedAtEnd)).plus({
        hours: 7,
      });
      carsQuery.andWhere(
        `(car.publishedAt)::DATE BETWEEN :publishedAtStart AND :publishedAtEnd`,
        {
          publishedAtStart: startDate,
          publishedAtEnd: endDate,
        },
      );
    }

    const cars = await carsQuery.getRawMany();

    for (const car of cars) {
      const exportedRow: CarExportRow = {
        publishedAtDate: car.publishedAt.toLocaleDateString(),
        publishedAtTime: car.publishedAt.toLocaleTimeString(),
        brand: car.brandName,
        model: car.modelName,
        submodel: car.subModelName,
        color: car.color,
        mileage: car.mileage,
        manufacturingYear: car.manufacturedYear,
        userType: car.userRole,
        dealerName: car.userDealerName ?? '-',
        userName: `${car.userFirstName} ${car.userLastName}`,
        userId: car.userUid,
        phoneNumber: car.userPhoneNumber,
        lineId: car.userLineId,
        carType: car.isMigrated ? 'Migrated' : 'Registered',
        carLocation: `${car.province} ${car.district}`,
        price: car.totalPrice,
        lowPrice: car.averagePrice * 0.8,
        mediumPrice: car.averagePrice * 0.88,
        highPrice: car.averagePrice * 0.95,
        postOnScoialMedia: car.postOnSocialMedia ? 'Yes' : 'No',
        clicks: car.views,
        views: car.clicks,
        impressions: car.impressions,
        transmission: car.transmissionName,
        bodyType: car.bodyTypeName,
        fuelType: car.fuelTypeName,
        isHotDealed: car.isHotDealed ? 'Yes' : 'No',
        isCarsmeupCertified: mapCmuCertifiedStatus(
          car.cmuCertifiedRequest?.status,
        ),
        carStatus: car.status,
      };

      carExportRows.push(exportedRow);
    }

    const reportFile = this.reportsService.createReportFile(
      carExportRows,
      carExportHeaders,
      carExportWidths,
      'car-report',
    );
    const uploadedReport = await this.s3FileService.fileUpload(
      reportFile,
      'reports/cars',
    );

    if (uploadedReport.location) {
      await this.reportsService.update(reportId, {
        rowCount: carExportRows.length,
        fileUrl: uploadedReport.location,
        fileSize: reportFile.size,
      });
      return true;
    }

    return false;
  }
}
