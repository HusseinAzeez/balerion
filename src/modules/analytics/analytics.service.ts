import { User } from '@/db/entities/user.entity';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateAnalyticsViewDto } from './dto/create-analytics-view.dto';
import { Repository } from 'typeorm';
import { Car } from '@/db/entities/car.entity';
import { Banner } from '@/db/entities/banner.entity';
import { AnalyticsView } from '@/db/entities/analytics-view.entity';
import { AnalyticsClick } from '@/db/entities/analytics-click.entity';
import { AnalyticsImpression } from '@/db/entities/analytics-impression.entity';
import { UserStatus } from '@/common/enums/user.enum';
import { QueryUserCountPerRoleDto } from './dto/query-user-count-per-role.dto';
import { CreateAnalyticsClickDto } from './dto/create-analytics-click.dto';
import { CreateAnalyticsImpressionDto } from './dto/create-analytics-impression.dto';
import { QueryCarCategorizeDto } from './dto/query-car-categorize.dto';
import { isEmpty } from 'lodash';
import { roundTo } from '@/common/helpers/number.helper';
import { carCategorizeStatus } from './analytics.constant';
import { QueryCarTopModelDto } from './dto/query-car-top-model.dto';
import { QueryLineChartDto } from './dto/query-line-chart.dto';
import { DateTime } from 'luxon';
import { DurationLike } from 'luxon/src/duration';
import {
  IAnalyticCarLineChart,
  IAnalyticCarLineChartData,
  IFindLineChartData,
  IFindLineChartDataFromAnalytic,
} from './interfaces/car-line-chart.interface';
import {
  AnalyticsCarChartType,
  AnalyticsClickType,
  AnalyticsImpressionType,
  AnalyticsViewType,
  LineChartReportType,
} from '@/common/enums/analytics.enum';
import { CarStatus } from '@/common/enums/car.enum';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(AnalyticsView)
    private readonly analyticsViewRepository: Repository<AnalyticsView>,

    @InjectRepository(AnalyticsClick)
    private readonly analyticsClickRepository: Repository<AnalyticsClick>,

    @InjectRepository(AnalyticsImpression)
    private readonly analyticsImpressionRepository: Repository<AnalyticsImpression>,

    @InjectRepository(Car)
    private readonly carRepository: Repository<Car>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Banner)
    private readonly bannerRepository: Repository<Banner>,
  ) {}

  async createViews(dto: CreateAnalyticsViewDto) {
    const { carIds, bannerIds, uid, viewType } = dto;
    let analytics: AnalyticsView = null;

    const analyticsList = [];

    if (viewType === AnalyticsViewType.CAR) {
      for (const carId of carIds) {
        analytics = await this.analyticsViewRepository.findOne({
          where: {
            uid,
            analyticsType: viewType,
            car: { id: carId },
          },
        });

        if (!analytics) {
          analytics = this.analyticsViewRepository.create({
            uid,
            analyticsType: viewType,
          });

          const car = await this.carRepository.findOne({
            where: { id: carId },
          });

          if (!car) {
            throw new NotFoundException(`Car #${carId} not found`);
          }

          analytics.car = car;

          await this.analyticsViewRepository.save(analytics);
        }

        analyticsList.push(analytics);
      }
    } else if (viewType === AnalyticsViewType.BANNER) {
      for (const bannerId of bannerIds) {
        analytics = await this.analyticsViewRepository.findOne({
          where: {
            uid,
            analyticsType: viewType,
            banner: { id: bannerId },
          },
        });

        if (!analytics) {
          analytics = this.analyticsViewRepository.create({
            uid,
            analyticsType: viewType,
          });

          const banner = await this.bannerRepository.findOne({
            where: { id: bannerId },
          });

          if (!banner) {
            throw new NotFoundException(`Banner #${bannerId} not found`);
          }

          analytics.banner = banner;

          await this.analyticsViewRepository.save(analytics);
        }

        analyticsList.push(analytics);
      }
    }

    return analyticsList;
  }

  async createClicks(dto: CreateAnalyticsClickDto) {
    const { carIds, bannerIds, uid, clickType } = dto;
    let analytics: AnalyticsClick = null;

    const analyticsList = [];

    if (clickType === AnalyticsClickType.CAR) {
      for (const carId of carIds) {
        analytics = await this.analyticsClickRepository.findOne({
          where: {
            uid,
            analyticsType: clickType,
            car: { id: carId },
          },
        });

        if (!analytics) {
          analytics = this.analyticsClickRepository.create({
            uid,
            analyticsType: clickType,
          });

          const car = await this.carRepository.findOne({
            where: { id: carId },
          });

          if (!car) {
            throw new NotFoundException(`Car #${carId} not found`);
          }

          analytics.car = car;
        } else {
          analytics.count += 1;
        }
        await this.analyticsClickRepository.save(analytics);

        analyticsList.push(analytics);
      }
    } else if (clickType === AnalyticsClickType.BANNER) {
      for (const bannerId of bannerIds) {
        analytics = await this.analyticsClickRepository.findOne({
          where: {
            uid,
            analyticsType: clickType,
            banner: { id: bannerId },
          },
        });

        if (!analytics) {
          analytics = this.analyticsClickRepository.create({
            uid,
            analyticsType: clickType,
          });

          const banner = await this.bannerRepository.findOne({
            where: { id: bannerId },
          });

          if (!banner) {
            throw new NotFoundException(`Banner #${bannerId} not found`);
          }

          analytics.banner = banner;
        } else {
          analytics.count += 1;
        }

        await this.analyticsClickRepository.save(analytics);

        analyticsList.push(analytics);
      }
    } else {
      analytics = await this.analyticsClickRepository.findOne({
        where: {
          uid,
          analyticsType: clickType,
        },
      });

      if (!analytics) {
        analytics = this.analyticsClickRepository.create({
          uid,
          analyticsType: clickType,
        });
      } else {
        analytics.count += 1;
      }

      await this.analyticsClickRepository.save(analytics);

      analyticsList.push(analytics);
    }

    return analyticsList;
  }

  async createImpressions(dto: CreateAnalyticsImpressionDto) {
    const { carIds, bannerIds, uid, impressionType } = dto;
    let analytics: AnalyticsImpression = null;

    const analyticsList = [];

    if (impressionType === AnalyticsImpressionType.CAR) {
      for (const carId of carIds) {
        analytics = await this.analyticsImpressionRepository.findOne({
          where: {
            uid,
            analyticsType: impressionType,
            car: { id: carId },
          },
        });

        if (!analytics) {
          analytics = this.analyticsImpressionRepository.create({
            uid,
            analyticsType: impressionType,
          });

          const car = await this.carRepository.findOne({
            where: { id: carId },
          });

          if (!car) {
            throw new NotFoundException(`Car #${carId} not found`);
          }

          analytics.car = car;
        } else {
          analytics.count += 1;
        }
        await this.analyticsImpressionRepository.save(analytics);

        analyticsList.push(analytics);
      }
    } else if (impressionType === AnalyticsImpressionType.BANNER) {
      for (const bannerId of bannerIds) {
        analytics = await this.analyticsImpressionRepository.findOne({
          where: {
            uid,
            analyticsType: impressionType,
            banner: { id: bannerId },
          },
        });

        if (!analytics) {
          analytics = this.analyticsImpressionRepository.create({
            uid,
            analyticsType: impressionType,
          });

          const banner = await this.bannerRepository.findOne({
            where: { id: bannerId },
          });

          if (!banner) {
            throw new NotFoundException(`Banner #${bannerId} not found`);
          }

          analytics.banner = banner;
        } else {
          analytics.count += 1;
        }

        await this.analyticsImpressionRepository.save(analytics);

        analyticsList.push(analytics);
      }
    }

    return analyticsList;
  }

  async userCountPerRole(query: QueryUserCountPerRoleDto) {
    const { startDate, endDate, province } = query;

    const usersCountResponse = {
      private: {
        verified: 0,
        unverified: 0,
      },
      dealer: {
        verified: 0,
        unverified: 0,
      },
      agent: {
        verified: 0,
        unverified: 0,
      },
      vendor: {
        verified: 0,
        unverified: 0,
      },
    };

    const usersCountQuery = this.userRepository
      .createQueryBuilder('user')
      .select('COUNT(user.id)::INT', 'count')
      .addSelect('user.role', 'role')
      .addSelect('user.status', 'status')
      .where('user.status IN(:...userStatus)', {
        userStatus: [UserStatus.UNVERIFIED, UserStatus.VERIFIED],
      })
      .groupBy('user.status')
      .addGroupBy('user.role');

    if (startDate && endDate) {
      usersCountQuery.andWhere(
        'user.createdAt BETWEEN :startDate AND :endDate',
        { startDate, endDate },
      );
    }

    if (province) {
      usersCountQuery.andWhere('user.province = :province', { province });
    }

    const usersCountResult = await usersCountQuery.getRawMany();

    for (const userCount of usersCountResult) {
      usersCountResponse[userCount.role][userCount.status] = userCount.count;
    }

    return usersCountResponse;
  }

  async findCarCategorize(query: QueryCarCategorizeDto) {
    const {
      startDate,
      endDate,
      brandName,
      modelName,
      manufacturedYear,
      subModelName,
      userTypes,
      isHotDealed,
      isCarsmeupCertified,
      province,
      district,
    } = query;

    const carGraphDataMap = {};

    for (const status of carCategorizeStatus) {
      carGraphDataMap[status] = {
        amount: 0,
        status,
        percent: 0,
      };
    }

    const carQuery = this.carRepository
      .createQueryBuilder('car')
      .select('count(car.id)::int as amount, car.status')
      .where('car.status in (:...status)', { status: carCategorizeStatus })
      .groupBy('car.status');
    if (startDate && endDate) {
      carQuery.andWhere('car.createdAt between :startDate and :endDate', {
        startDate,
        endDate,
      });
    }
    if (brandName) {
      carQuery.andWhere('car.brandName = :brandName', { brandName });
    }
    if (modelName) {
      carQuery.andWhere('car.modelName = :modelName', { modelName });
    }
    if (manufacturedYear) {
      carQuery.andWhere('car.manufacturedYear = :manufacturedYear', {
        manufacturedYear,
      });
    }
    if (subModelName) {
      carQuery.andWhere('car.subModelName = :subModelName', {
        subModelName,
      });
    }
    if (isCarsmeupCertified) {
      carQuery.andWhere('car.isCarsmeupCertified = :isCarsmeupCertified', {
        isCarsmeupCertified,
      });
    }
    if (isHotDealed) {
      carQuery.andWhere('car.isHotDealed = :isHotDealed', { isHotDealed });
    }
    if (province) {
      carQuery.andWhere('car.province = :province', {
        province,
      });
    }
    if (district) {
      carQuery.andWhere('car.district = :district', {
        district,
      });
    }
    if (!isEmpty(userTypes)) {
      carQuery.innerJoin('car.user', 'user', 'user.role in (:...userTypes)', {
        userTypes,
      });
    }
    carQuery.orderBy('amount', 'DESC');

    const carDataDb = await carQuery.getRawMany();

    const sum = carDataDb.reduce(
      (accumulator, currentValue) => accumulator + currentValue.amount,
      0,
    );

    for (const car of carDataDb) {
      const { amount, status } = car;
      const percent = roundTo((amount / sum) * 100, 2);

      carGraphDataMap[status] = {
        amount,
        status,
        percent,
      };
    }

    return Object.values(carGraphDataMap);
  }

  async findCarTopModel(query: QueryCarTopModelDto) {
    const {
      startDate,
      endDate,
      brandName,
      modelName,
      manufacturedYear,
      subModelName,
      userTypes,
      isHotDealed,
      isCarsmeupCertified,
      province,
      district,
      limit,
    } = query;

    const carQuery = this.analyticsViewRepository
      .createQueryBuilder('analyticView')
      .select(
        `sum(analyticView.count)::INT AS amount,
        CONCAT(car.manufacturedYear, ' - ', car.brandName, ' ', car.modelName, ', ', car.subModelName) AS name`,
      )
      .innerJoin('analyticView.car', 'car')
      .where('car.status IN (:...status)', {
        status: [CarStatus.PUBLISHED, CarStatus.RESERVED],
      })
      .groupBy(
        `car.manufacturedYear, car.brandName, car.modelName, car.subModelName`,
      );
    if (startDate && endDate) {
      carQuery.andWhere('car.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }
    if (brandName) {
      carQuery.andWhere('car.brandName = :brandName', { brandName });
    }
    if (modelName) {
      carQuery.andWhere('car.modelName = :modelName', { modelName });
    }
    if (manufacturedYear) {
      carQuery.andWhere('car.manufacturedYear = :manufacturedYear', {
        manufacturedYear,
      });
    }
    if (subModelName) {
      carQuery.andWhere('car.subModelName = :subModelName', {
        subModelName,
      });
    }
    if (isCarsmeupCertified) {
      carQuery.andWhere('car.isCarsmeupCertified = :isCarsmeupCertified', {
        isCarsmeupCertified,
      });
    }
    if (isHotDealed) {
      carQuery.andWhere('car.isHotDealed = :isHotDealed', { isHotDealed });
    }
    if (province) {
      carQuery.andWhere('car.province = :province', {
        province,
      });
    }
    if (district) {
      carQuery.andWhere('car.district = :district', {
        district,
      });
    }
    if (!isEmpty(userTypes)) {
      carQuery.innerJoin('car.user', 'user', 'user.role IN (:...userTypes)', {
        userTypes,
      });
    }
    carQuery
      .orderBy('amount', 'DESC')
      .addOrderBy(
        `CONCAT(car.manufacturedYear, ' - ', car.brandName, ' ', car.modelName, ', ', car.subModelName)`,
        'ASC',
      )
      .limit(limit);

    const carDataDb = await carQuery.getRawMany();

    return carDataDb;
  }

  async findCarLineChart(query: QueryLineChartDto) {
    const {
      startDate,
      endDate,
      brandName,
      modelName,
      manufacturedYear,
      subModelName,
      userTypes,
      isHotDealed,
      isCarsmeupCertified,
      province,
      district,
      reportType,
    } = query;

    const { chartType, chartData } = this.generateLineChatTemplate({
      startDate,
      endDate,
    });

    let reportData: { createdAt: Date; count: number }[];

    if (reportType === LineChartReportType.NUMBER_OF_CAR) {
      reportData = await this.findLineChartDataCar({
        startDate,
        endDate,
        brandName,
        modelName,
        manufacturedYear,
        subModelName,
        isHotDealed,
        isCarsmeupCertified,
        province,
        district,
        userTypes,
      });
    } else {
      reportData = await this.findLineChartDataFromAnalytics({
        reportType,
        startDate,
        endDate,
        brandName,
        modelName,
        manufacturedYear,
        subModelName,
        isHotDealed,
        isCarsmeupCertified,
        province,
        district,
        userTypes,
      });
    }

    if (reportData.length) {
      for (let i = 0; i < chartData.length; i++) {
        const lowerBound = chartData[i].date;
        const upperBound = chartData[i + 1]?.date ?? endDate;
        const data = reportData
          .filter(
            (data) =>
              data.createdAt >= lowerBound && data.createdAt <= upperBound,
          )
          .reduce(
            (accumulator, currentValue) => accumulator + currentValue.count,
            0,
          );
        chartData[i].value = data;
      }
    }

    return { chartType, chartData };
  }

  private async findLineChartDataFromAnalytics(
    input: IFindLineChartDataFromAnalytic,
  ) {
    const {
      reportType,
      startDate,
      endDate,
      brandName,
      modelName,
      manufacturedYear,
      subModelName,
      isCarsmeupCertified,
      isHotDealed,
      province,
      district,
      userTypes,
    } = input;

    let repository: Repository<
      AnalyticsView | AnalyticsClick | AnalyticsImpression
    >;

    switch (reportType) {
      case LineChartReportType.VIEW:
        repository = this.analyticsViewRepository;
        break;
      case LineChartReportType.IMPRESSION:
        repository = this.analyticsImpressionRepository;
        break;
      case LineChartReportType.CLICK:
        repository = this.analyticsClickRepository;
        break;
      default:
        repository = this.analyticsViewRepository;
    }

    const analyticQuery = repository
      .createQueryBuilder('analytics')
      .select(['analytics.count', 'analytics.createdAt'])
      .innerJoin('analytics.car', 'car')
      .where('car.status IN (:...status)', {
        status: [CarStatus.PUBLISHED, CarStatus.RESERVED],
      })
      .andWhere('analytics.analyticsType = :analyticsType', {
        analyticsType: 'car',
      });

    if (startDate && endDate) {
      analyticQuery.andWhere(
        'analytics.createdAt BETWEEN :startDate AND :endDate',
        {
          startDate,
          endDate,
        },
      );
    }
    if (brandName) {
      analyticQuery.andWhere('car.brandName = :brandName', { brandName });
    }
    if (modelName) {
      analyticQuery.andWhere('car.modelName = :modelName', { modelName });
    }
    if (manufacturedYear) {
      analyticQuery.andWhere('car.manufacturedYear = :manufacturedYear', {
        manufacturedYear,
      });
    }
    if (subModelName) {
      analyticQuery.andWhere('car.subModelName = :subModelName', {
        subModelName,
      });
    }
    if (isCarsmeupCertified) {
      analyticQuery.andWhere('car.isCarsmeupCertified = :isCarsmeupCertified', {
        isCarsmeupCertified,
      });
    }
    if (isHotDealed) {
      analyticQuery.andWhere('car.isHotDealed = :isHotDealed', { isHotDealed });
    }
    if (province) {
      analyticQuery.andWhere('car.province = :province', {
        province,
      });
    }
    if (district) {
      analyticQuery.andWhere('car.district = :district', {
        district,
      });
    }
    if (!isEmpty(userTypes)) {
      analyticQuery.innerJoin(
        'car.user',
        'user',
        'user.role in (:...userTypes)',
        {
          userTypes,
        },
      );
    }

    return await analyticQuery.getMany();
  }

  private async findLineChartDataCar(
    input: IFindLineChartData,
  ): Promise<{ createdAt: Date; count: number }[]> {
    const {
      startDate,
      endDate,
      brandName,
      modelName,
      manufacturedYear,
      subModelName,
      isCarsmeupCertified,
      isHotDealed,
      province,
      district,
      userTypes,
    } = input;

    const carQuery = this.carRepository
      .createQueryBuilder('car')
      .select('car.publishedAt', 'createdAt')
      .addSelect('1', 'count')
      .where('car.status IN (:...status)', {
        status: [CarStatus.PUBLISHED, CarStatus.RESERVED],
      });

    if (startDate && endDate) {
      carQuery.andWhere('car.publishedAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }
    if (brandName) {
      carQuery.andWhere('car.brandName = :brandName', { brandName });
    }
    if (modelName) {
      carQuery.andWhere('car.modelName = :modelName', { modelName });
    }
    if (manufacturedYear) {
      carQuery.andWhere('car.manufacturedYear = :manufacturedYear', {
        manufacturedYear,
      });
    }
    if (subModelName) {
      carQuery.andWhere('car.subModelName = :subModelName', {
        subModelName,
      });
    }
    if (isCarsmeupCertified) {
      carQuery.andWhere('car.isCarsmeupCertified = :isCarsmeupCertified', {
        isCarsmeupCertified,
      });
    }
    if (isHotDealed) {
      carQuery.andWhere('car.isHotDealed = :isHotDealed', { isHotDealed });
    }
    if (province) {
      carQuery.andWhere('car.province = :province', {
        province,
      });
    }
    if (district) {
      carQuery.andWhere('car.district = :district', {
        district,
      });
    }
    if (!isEmpty(userTypes)) {
      carQuery.innerJoin('car.user', 'user', 'user.role IN (:...userTypes)', {
        userTypes,
      });
    }

    return carQuery.getRawMany();
  }

  private generateLineChatTemplate(input: {
    startDate: Date;
    endDate: Date;
  }): IAnalyticCarLineChart {
    const startDate = DateTime.fromJSDate(input.startDate);
    const endDate = DateTime.fromJSDate(input.endDate);

    const differenceTotalDays = Math.max(
      endDate.diff(startDate, 'days').days,
      0,
    );

    const differenceTotalMonth = Math.max(
      endDate.diff(startDate, 'months').months,
      0,
    );

    let currentDate = startDate;
    let duration: DurationLike;

    if (startDate >= endDate)
      throw new BadRequestException(
        `Invalid input parameter 'date' invalid date`,
      );

    let chartType: AnalyticsCarChartType;
    const chartData: IAnalyticCarLineChartData[] = [];

    if (differenceTotalDays < 1) {
      chartType = AnalyticsCarChartType.HOUR;
      duration = { hours: 3 };
    } else if (differenceTotalMonth < 1) {
      chartType = AnalyticsCarChartType.DAY;
      duration = { days: 1 };
    } else if (differenceTotalMonth < 12) {
      chartType = AnalyticsCarChartType.MONTH;
      currentDate = startDate.minus({
        days: startDate.day - 1,
      });
      duration = { months: 1 };
    } else {
      chartType = AnalyticsCarChartType.YEAR;
      currentDate = startDate.set({ day: 1, month: 1 });
      duration = { years: 1 };
    }

    while (currentDate <= endDate) {
      chartData.push({
        value: 0,
        date: currentDate.toJSDate(),
      });
      currentDate = currentDate.plus(duration);
    }

    return { chartType, chartData };
  }
}
