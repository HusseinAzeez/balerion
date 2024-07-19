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
import { AnalyticsClickType } from '@/common/enums/analytics.enum';

@Entity('analytics_clicks')
export class AnalyticsClick {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  uid: string;

  @Column({ default: 1 })
  count: number;

  @Column({
    type: 'enum',
    enum: AnalyticsClickType,
    default: AnalyticsClickType.CAR,
  })
  analyticsType: AnalyticsClickType;

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
