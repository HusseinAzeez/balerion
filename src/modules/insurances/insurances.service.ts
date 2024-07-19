import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Repository } from 'typeorm';
import { isEmpty } from 'lodash';

import { BoltSFTPService } from '@/services';
import { InjectRepository } from '@nestjs/typeorm';
import { BoltInsurance } from '@/db/entities/bolt-insurance.entity';
import { QueryInsuranceDto } from './dto/query-insurance.dto';
import { PaginationsService } from '../paginations/paginations.service';

@Injectable()
export class InsurancesService {
  private readonly logger = new Logger(InsurancesService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly paginationsService: PaginationsService,
    private readonly boltSftpService: BoltSFTPService,

    @InjectRepository(BoltInsurance)
    private readonly boltInsuranceRepository: Repository<BoltInsurance>,
  ) {}

  async findAll(query: QueryInsuranceDto) {
    const {
      search,
      status,
      insuredAtStart,
      insuredAtEnd,
      sortBy,
      sortDirection,
      limitPerPage,
      all,
      page,
    } = query;

    const insuranceQuery = this.boltInsuranceRepository
      .createQueryBuilder('insurance')
      .select('insurance.insuranceType')
      .addSelect('insurance.insuranceCompany')
      .addSelect('insurance.productType')
      .addSelect('insurance.packageName')
      .addSelect('insurance.statusReason')
      .addSelect('insurance.insuredAt')
      .addSelect('insurance.policyNumber')
      .addSelect('insurance.policyStartDate')
      .addSelect('insurance.policyEndDate')
      .addSelect('insurance.totalAmount')
      .addSelect('insurance.netPremium')
      .addSelect('insurance.discountAmount')
      .addSelect('insurance.firstName')
      .addSelect('insurance.lastName')
      .addSelect('insurance.applicantEmail')
      .where(`insurance.statusReason IN (:...status)`, { status });

    if (search) {
      insuranceQuery.andWhere(
        `(insurance.insuranceType ILIKE :search OR
          insurance.insuranceCompany ILIKE :search OR
          insurance.productType ILIKE :search OR
          insurance.packageName ILIKE :search OR
          insurance.firstName ILIKE :search OR
          insurance.lastName ILIKE :search OR
          insurance.applicantEmail ILIKE :search)`,
        {
          search: `%${search}%`,
        },
      );
    }

    if (insuredAtStart && insuredAtEnd) {
      insuranceQuery.andWhere(
        'insurance.insuredAt BETWEEN :insuredAtStart AND :insuredAtEnd',
        { insuredAtStart, insuredAtEnd },
      );
    }

    insuranceQuery.orderBy(`${sortBy}`, sortDirection as 'ASC' | 'DESC');

    return await this.paginationsService.paginate(insuranceQuery, {
      limitPerPage,
      all,
      page,
    });
  }

  @Cron(CronExpression.EVERY_DAY_AT_2AM, {
    name: 'CheckBoltInsurance',
  })
  async checkBoltInsurance() {
    if (this.configService.get('mode') === 'development') {
      this.logger.log(
        'CheckBoltInsurance job: development env detected, skipping',
      );
      return;
    }

    const insurances = await this.boltSftpService.getInsuranceDataDaily();

    if (!isEmpty(insurances)) {
      for (const insurance of insurances) {
        let boltInsurance = await this.boltInsuranceRepository.findOne({
          where: {
            bolttechId: insurance.bolttechId,
          },
        });

        boltInsurance = this.boltInsuranceRepository.create({
          id: boltInsurance?.id,
          ...insurance,
        });

        if (insurance.externalCustomerId) {
          boltInsurance.userId = insurance.externalCustomerId;
        }

        await this.boltInsuranceRepository.save(boltInsurance);
      }
    }
  }
}
