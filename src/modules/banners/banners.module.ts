import { Module } from '@nestjs/common';
import { BannersService } from './banners.service';
import { BannersController } from './banners.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Banner } from '@/db/entities/banner.entity';
import { S3FileService } from '@/services';
import { BullModule } from '@nestjs/bull';
import { BannerProducer } from './producers/banner.producer';
import { BannerConsumer } from './consumers/banner.consumer';
import { PaginationsService } from '../paginations/paginations.service';
import { BannerSubscriber } from '@/db/subscribers/banner.subscriber';
import { Staff } from '@/db/entities/staff.entity';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'banner' }),
    TypeOrmModule.forFeature([Banner, Staff]),
  ],
  controllers: [BannersController],
  providers: [
    BannersService,
    S3FileService,
    BannerProducer,
    BannerConsumer,
    PaginationsService,
    BannerSubscriber,
  ],
  exports: [BannerProducer],
})
export class BannersModule {}
