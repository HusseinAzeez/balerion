import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Unique,
} from 'typeorm';

import { Car } from './car.entity';
import { User } from './user.entity';

@Entity('save_cars')
@Unique(['userId', 'carId'])
export class SaveCar {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  carId: number;

  @CreateDateColumn({ readonly: true })
  createdAt: Date;

  @UpdateDateColumn({ readonly: true })
  updatedAt: Date;

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => Car)
  car: Car;
}
