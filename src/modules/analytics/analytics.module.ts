import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Banner } from '@/db/entities/banner.entity';
import { User } from '@/db/entities/user.entity';
import { Car } from '@/db/entities/car.entity';
import { AnalyticsView } from '@/db/entities/analytics-view.entity';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { AnalyticsClick } from '@/db/entities/analytics-click.entity';
import { AnalyticsImpression } from '@/db/entities/analytics-impression.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Banner,
      AnalyticsView,
      AnalyticsClick,
      AnalyticsImpression,
      User,
      Car,
    ]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
