import {
  Column,
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  PrimaryColumn,
  ManyToMany,
} from 'typeorm';
import { CarSubModel } from './car-sub-model.entity';
import { Car } from './car.entity';

@Entity('car_fuel_types')
export class CarFuelType {
  @PrimaryColumn({ unique: true })
  name: string;

  @Column({ default: true })
  displayable: boolean;

  @CreateDateColumn({ readonly: true })
  createdAt: Date;

  @UpdateDateColumn({ readonly: true })
  updatedAt: Date;

  @OneToMany(() => Car, (car) => car.fuelType)
  cars: Car[];

  @ManyToMany(() => CarSubModel, (carSubModel) => carSubModel.fuelTypes)
  subModels: CarSubModel[];
}
