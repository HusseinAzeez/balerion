import {
  Column,
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { CarModel } from './car-model.entity';
import { Car } from './car.entity';

@Entity('car_brands')
export class CarBrand {
  @PrimaryColumn({ unique: true })
  name: string;

  @Column({ default: true })
  displayable: boolean;

  @CreateDateColumn({ readonly: true })
  createdAt: Date;

  @UpdateDateColumn({ readonly: true })
  updatedAt: Date;

  @OneToMany(() => Car, (car) => car.brand)
  cars: Car[];

  @OneToMany(() => CarModel, (carModel) => carModel.brand)
  models: CarModel[];
}
