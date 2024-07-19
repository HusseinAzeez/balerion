import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { BannerType } from '@/common/enums/banner.enum';

@Injectable()
export class BannerProducer {
  constructor(@InjectQueue('banner') private bannerQueue: Queue) {}

  async queueUpStartBannerJob(bannerId: number, delay: number) {
    const jobIdStart = `start_banner_${bannerId}`;
    await this.bannerQueue.add(
      'start-schedule-banner',
      {
        bannerId,
      },
      { jobId: jobIdStart, delay: delay },
    );
  }

  async removeScheduledBannerJob(bannerId: number) {
    const jobIdStart = `start_banner_${bannerId}`;
    const job = await this.bannerQueue.getJob(jobIdStart);
    await job.remove();
  }
}
