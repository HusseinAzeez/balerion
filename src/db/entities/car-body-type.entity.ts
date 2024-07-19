import {
  Column,
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  PrimaryColumn,
  ManyToMany,
} from 'typeorm';
import { MonthlyInstallment } from './monthly-installment.entity';
import { CarSubModel } from './car-sub-model.entity';
import { Car } from './car.entity';

@Entity('car_body_types')
export class CarBodyType {
  @PrimaryColumn({ unique: true })
  name: string;

  @Column({ default: true })
  displayable: boolean;

  @CreateDateColumn({ readonly: true })
  createdAt: Date;

  @UpdateDateColumn({ readonly: true })
  updatedAt: Date;

  @OneToMany(() => Car, (car) => car.bodyType)
  cars: Car[];

  @ManyToMany(() => CarSubModel, (carSubModel) => carSubModel.bodyTypes)
  subModels: CarSubModel[];

  @OneToMany(
    () => MonthlyInstallment,
    (monthlyInstallment) => monthlyInstallment.bodyType,
  )
  monthlyInstallments: MonthlyInstallment[];
}
