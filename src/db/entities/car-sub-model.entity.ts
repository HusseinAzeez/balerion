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
import { CarYear } from './car-year.entity';
import { CarModel } from './car-model.entity';
import { Car } from './car.entity';
import { CarBodyType } from './car-body-type.entity';
import { CarFuelType } from './car-fuel-type.entity';
import { CarEngine } from './car-engine.entity';
import { CarMarketprice } from './car-marketprice.entity';

@Entity('car_sub_models')
export class CarSubModel {
  @PrimaryColumn({ unique: true })
  name: string;

  @Column({ default: true })
  displayable: boolean;

  @CreateDateColumn({ readonly: true })
  createdAt: Date;

  @UpdateDateColumn({ readonly: true })
  updatedAt: Date;

  @ManyToOne(() => CarModel, (carModel) => carModel.subModels)
  model: CarModel;

  @OneToMany(() => Car, (car) => car.subModel)
  cars: Car[];

  @OneToMany(
    () => CarMarketprice,
    (carMarketPrice) => carMarketPrice.subModel,
    { cascade: true },
  )
  marketprices: CarMarketprice[];

  @ManyToMany(() => CarYear, (carYear) => carYear.subModels, { cascade: true })
  @JoinTable({ name: 'car_sub_models_years' })
  years: CarYear[];

  @ManyToMany(() => CarBodyType, (carBodyType) => carBodyType.subModels, {
    cascade: true,
  })
  @JoinTable({ name: 'car_sub_models_body_types' })
  bodyTypes: CarBodyType[];

  @ManyToMany(() => CarFuelType, (carFuelType) => carFuelType.subModels, {
    cascade: true,
  })
  @JoinTable({ name: 'car_sub_models_fuel_types' })
  fuelTypes: CarFuelType[];

  @ManyToMany(() => CarEngine, (carEngine) => carEngine.subModels, {
    cascade: true,
  })
  @JoinTable({ name: 'car_sub_models_engines' })
  engines: CarFuelType[];
}
