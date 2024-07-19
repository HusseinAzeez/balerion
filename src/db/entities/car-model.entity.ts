import {
  Column,
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  JoinTable,
  ManyToMany,
} from 'typeorm';
import { CarBrand } from './car-brand.entity';
import { CarLifestyle } from './car-lifestyle.entity';
import { CarSubModel } from './car-sub-model.entity';
import { Car } from './car.entity';

@Entity('car_models')
export class CarModel {
  @PrimaryColumn({ unique: true })
  name: string;

  @Column({ default: true })
  displayable: boolean;

  @CreateDateColumn({ readonly: true })
  createdAt: Date;

  @UpdateDateColumn({ readonly: true })
  updatedAt: Date;

  @ManyToOne(() => CarBrand, (carBrand) => carBrand.models)
  brand: CarBrand;

  @OneToMany(() => CarSubModel, (carSubModel) => carSubModel.model)
  subModels: CarSubModel[];

  @OneToMany(() => Car, (car) => car.model)
  cars: Car[];

  @ManyToMany(() => CarLifestyle, (carLifestyle) => carLifestyle.models)
  @JoinTable({ name: 'car_models_lifestyles' })
  lifestyles: CarLifestyle[];
}
