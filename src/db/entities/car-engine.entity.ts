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

@Entity('car_engines')
export class CarEngine {
  @PrimaryColumn({ unique: true })
  name: string;

  @Column({ default: true })
  displayable: boolean;

  @CreateDateColumn({ readonly: true })
  createdAt: Date;

  @UpdateDateColumn({ readonly: true })
  updatedAt: Date;

  @OneToMany(() => Car, (car) => car.engine)
  cars: Car[];

  @ManyToMany(() => CarSubModel, (carSubModel) => carSubModel.engines)
  subModels: CarSubModel[];
}
