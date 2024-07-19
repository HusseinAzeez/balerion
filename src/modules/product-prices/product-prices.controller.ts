import { Controller, Get, Param, Query } from '@nestjs/common';
import { ProductPricesService } from './product-prices.service';
import { QueryProductPriceDto } from './dto/product-price.dto';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '@/common/decorators';

@ApiTags('Product prices')
@Controller('product-prices')
export class ProductPricesController {
  constructor(private readonly productPricesService: ProductPricesService) {}

  @Get()
  @Public()
  findByRoleAndServiceType(@Query() query: QueryProductPriceDto) {
    return this.productPricesService.findByRoleAndProductType(query);
  }

  @Get(':id')
  @Public()
  findOne(@Param('id') id: string) {
    return this.productPricesService.findOne(+id);
  }
}
