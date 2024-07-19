import { Public } from '@/common/decorators';
import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { QueryServicePriceDto } from './dto/query-service-prices.dto';
import { ServicePricesService } from './service-prices.service';

@ApiTags('Service prices')
@Controller('service-prices')
export class ServicePricesController {
  constructor(private readonly servicePricesService: ServicePricesService) {}

  @Get()
  @Public()
  findByRoleAndServiceType(@Query() dto: QueryServicePriceDto) {
    return this.servicePricesService.findByRoleAndServiceType(dto);
  }

  @Get(':id')
  @Public()
  findOne(@Param('id') id: string) {
    return this.servicePricesService.findOne(+id);
  }
}
