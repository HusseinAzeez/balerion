import { BannerStatus, BannerType } from '@/common/enums/banner.enum';
import { IsEnum } from 'class-validator';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AnalyticsClick } from './analytics-click.entity';
import { AnalyticsImpression } from './analytics-impression.entity';
import { AnalyticsView } from './analytics-view.entity';

@Entity('banners')
export class Banner {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  uid: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  clientName: string;

  @Column({ nullable: true })
  url: string;

  @Column()
  desktopUrl: string;

  @Column()
  mobileUrl: string;

  @CreateDateColumn({ readonly: true })
  createdAt: Date;

  @UpdateDateColumn({ readonly: true })
  updatedAt: Date;

  @DeleteDateColumn({ readonly: true })
  deletedAt: Date;

  @Column({ nullable: true })
  scheduleAt: Date;

  @Column({
    type: 'enum',
    enum: BannerStatus,
    default: BannerStatus.DRAFT,
  })
  status: BannerStatus;

  @Column({
    type: 'enum',
    enum: BannerType,
    default: BannerType.HERO_BANNER,
  })
  bannerType: BannerType;

  @Column({ nullable: true })
  runningNo: number;

  @OneToMany(() => AnalyticsView, (analyticsViews) => analyticsViews.banner)
  views: AnalyticsView[];

  @OneToMany(() => AnalyticsClick, (analyticsClick) => analyticsClick.banner)
  clicks: AnalyticsClick[];

  @OneToMany(
    () => AnalyticsImpression,
    (analyticsImpression) => analyticsImpression.banner,
  )
  impressions: AnalyticsImpression[];
}
