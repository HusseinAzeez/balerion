import {
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  PrimaryColumn,
} from 'typeorm';
import { Car } from './car.entity';

@Entity('car_equipments')
export class CarEquipment {
  @PrimaryColumn({ unique: true })
  name: string;

  @CreateDateColumn({ readonly: true })
  createdAt: Date;

  @UpdateDateColumn({ readonly: true })
  updatedAt: Date;

  @ManyToMany(() => Car, (car) => car.equipments)
  cars: Car[];
}
