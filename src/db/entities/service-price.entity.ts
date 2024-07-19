import { ServicePriceType } from '@/common/enums/service-price.enum';
import { ColumnNumericTransformer } from '@/common/transformers/column-numeric.transformer';
import {
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('service_prices')
export class ServicePrice {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: ServicePriceType,
    default: ServicePriceType.ROADSIDE_ASSIST,
  })
  serviceType: ServicePriceType;

  @Column()
  quantity: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  pricePerUnit: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  price: number;

  @CreateDateColumn({ readonly: true })
  createdAt: Date;

  @UpdateDateColumn({ readonly: true })
  updatedAt: Date;
}
