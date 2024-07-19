import { Module } from '@nestjs/common';
import { ProductPricesService } from './product-prices.service';
import { ProductPricesController } from './product-prices.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductPrice } from '@/db/entities/product-price.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProductPrice])],
  controllers: [ProductPricesController],
  providers: [ProductPricesService],
  exports: [ProductPricesService],
})
export class ProductPricesModule {}
