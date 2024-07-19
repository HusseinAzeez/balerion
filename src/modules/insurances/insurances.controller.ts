import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { BoltInsurance } from '@/db/entities/bolt-insurance.entity';
import { QueryInsuranceDto } from './dto/query-insurance.dto';
import { InsurancesService } from './insurances.service';

@ApiTags('Insurances')
@Controller('insurances')
export class InsurancesController {
  constructor(private readonly insurancesService: InsurancesService) {}

  @Get()
  @ApiOkResponse({ type: BoltInsurance, isArray: true })
  findAll(@Query() query: QueryInsuranceDto) {
    return this.insurancesService.findAll(query);
  }
}
