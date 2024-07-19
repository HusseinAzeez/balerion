import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Car } from './car.entity';
import { Banner } from '@/db/entities/banner.entity';
import { AnalyticsViewType } from '@/common/enums/analytics.enum';

@Entity('analytics_views')
export class AnalyticsView {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  uid: string;

  @Column({ default: 1 })
  count: number;

  @Column({
    type: 'enum',
    enum: AnalyticsViewType,
    default: AnalyticsViewType.CAR,
  })
  analyticsType: AnalyticsViewType;

  @CreateDateColumn({ readonly: true })
  createdAt: Date;

  @UpdateDateColumn({ readonly: true })
  updatedAt: Date;

  @ManyToOne(() => Car, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
    nullable: true,
  })
  car?: Car;

  @ManyToOne(() => Banner, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
    nullable: true,
  })
  banner?: Banner;
}
