import { Module } from '@nestjs/common';
import { ServicePricesService } from './service-prices.service';
import { ServicePricesController } from './service-prices.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServicePrice } from '@/db/entities/service-price.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ServicePrice])],
  controllers: [ServicePricesController],
  providers: [ServicePricesService],
})
export class ServicePricesModule {}
