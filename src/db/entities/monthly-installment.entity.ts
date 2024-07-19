import { MonthlyInstallmentLoanTerm } from '@/common/enums/monthly-installment.enum';
import { ColumnNumericTransformer } from '@/common/transformers/column-numeric.transformer';
import {
  Column,
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  ManyToMany,
  ManyToOne,
} from 'typeorm';
import { CarBodyType } from './car-body-type.entity';
import { Car } from './car.entity';

@Entity('monthly_installments')
export class MonthlyInstallment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  year: number;

  @Column({
    type: 'enum',
    enum: MonthlyInstallmentLoanTerm,
    default: MonthlyInstallmentLoanTerm.MONTHS_84,
  })
  loanTerm: MonthlyInstallmentLoanTerm;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  interestRate: number;

  @CreateDateColumn({ readonly: true })
  createdAt: Date;

  @UpdateDateColumn({ readonly: true })
  updatedAt: Date;

  @ManyToOne(
    () => CarBodyType,
    (carBodyType) => carBodyType.monthlyInstallments,
  )
  bodyType: CarBodyType;

  @ManyToMany(() => Car, (car) => car.bodyType)
  cars: Car[];
}
