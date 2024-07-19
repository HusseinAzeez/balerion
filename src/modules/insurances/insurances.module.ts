import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InsurancesService } from './insurances.service';
import { InsurancesController } from './insurances.controller';
import { BoltInsurance } from '@/db/entities/bolt-insurance.entity';
import { PaginationsService } from '../paginations/paginations.service';
import { BoltSFTPService } from '@/services';

@Module({
  imports: [TypeOrmModule.forFeature([BoltInsurance])],
  controllers: [InsurancesController],
  providers: [InsurancesService, PaginationsService, BoltSFTPService],
})
export class InsurancesModule {}
