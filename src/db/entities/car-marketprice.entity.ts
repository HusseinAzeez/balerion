import { ColumnNumericTransformer } from '@/common/transformers/column-numeric.transformer';
import {
  Column,
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CarSubModel } from './car-sub-model.entity';

@Entity('car_marketprices')
export class CarMarketprice {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  price: number;

  @Column()
  manufacturedYear: number;

  @CreateDateColumn({ readonly: true })
  createdAt: Date;

  @UpdateDateColumn({ readonly: true })
  updatedAt: Date;

  @ManyToOne(() => CarSubModel, (carSubModel) => carSubModel.marketprices, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  subModel: CarSubModel;
}
