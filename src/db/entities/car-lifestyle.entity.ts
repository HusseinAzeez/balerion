import {
  Column,
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  PrimaryColumn,
  ManyToMany,
} from 'typeorm';
import { CarModel } from './car-model.entity';
import { Car } from './car.entity';

@Entity('car_lifestyles')
export class CarLifestyle {
  @PrimaryColumn({ unique: true })
  name: string;

  @Column({ default: true })
  displayable: boolean;

  @CreateDateColumn({ readonly: true })
  createdAt: Date;

  @UpdateDateColumn({ readonly: true })
  updatedAt: Date;

  @OneToMany(() => Car, (car) => car.lifestyle)
  cars: Car[];

  @ManyToMany(() => CarModel, (carModel) => carModel.lifestyles)
  models: CarModel[];
}
