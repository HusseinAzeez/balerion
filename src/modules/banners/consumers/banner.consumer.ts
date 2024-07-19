import { Process, Processor } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bull';
import { BannersService } from '../banners.service';
import { BannerProducer } from '../producers/banner.producer';

@Injectable()
@Processor('banner')
export class BannerConsumer {
  private readonly logger = new Logger(BannerProducer.name);

  constructor(private readonly bannerService: BannersService) {}

  @Process('start-schedule-banner')
  async handleSetStart(job: Job<unknown>) {
    this.logger.log('RUNNER: Start scheduler banner', job.data['bannerId']);
    await this.bannerService.setStartSchedulerBanner(job.data['bannerId']);
    this.logger.log('RUNNER: End started scheduler banner');
  }
}
