import {
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryColumn,
  ManyToMany,
} from 'typeorm';
import { CarSubModel } from './car-sub-model.entity';

@Entity('car_years')
export class CarYear {
  @PrimaryColumn({ unique: true })
  name: number;

  @CreateDateColumn({ readonly: true })
  createdAt: Date;

  @UpdateDateColumn({ readonly: true })
  updatedAt: Date;

  @ManyToMany(() => CarSubModel, (carSubModel) => carSubModel.years)
  subModels: CarSubModel[];
}
