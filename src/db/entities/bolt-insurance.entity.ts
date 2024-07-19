import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { ColumnNumericTransformer } from '@/common/transformers/column-numeric.transformer';
import { User } from './user.entity';

@Entity('bolt_insurances')
export class BoltInsurance {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  bolttechId: string;

  @Column()
  insuranceType: string;

  @Column()
  insuranceCompany: string;

  @Column()
  productType: string;

  @Column({ nullable: true })
  packageName: string;

  @Column()
  statusReason: string;

  @Column({ nullable: true })
  insuredAt: Date;

  @Column({ nullable: true })
  orderSoldDate: Date;

  @Column()
  policyNumber: string;

  @Column({ nullable: true })
  policyStartDate: Date;

  @Column({ nullable: true })
  policyEndDate: Date;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  totalAmount: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  netPremium: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  discountAmount: number;

  @Column()
  voucherCode: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: true })
  applicantEmail: string;

  @Column({ nullable: true })
  applicantPhone: string;

  @Column({ nullable: true })
  idType: string;

  @Column({ nullable: true })
  idNumber: string;

  @Column({ nullable: true })
  street1: string;

  @Column({ nullable: true })
  street2: string;

  @Column({ nullable: true })
  subDistrict: string;

  @Column({ nullable: true })
  province: string;

  @Column({ nullable: true })
  postCode: string;

  @Column({ nullable: true })
  channel: string;

  @Column({ nullable: true })
  salesMethod: string;

  @Column({ nullable: true })
  sourceUTM: string;

  @Column({ nullable: true })
  sourceMedium: string;

  @Column({ nullable: true })
  sourceCampaign: string;

  @Column({ nullable: true })
  partner: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  stampDuty: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  vat: number;

  @Column({ nullable: true })
  birthday: string;

  @Column({ nullable: true })
  paymentMethod: string;

  @Column({ nullable: true })
  paymentTransactionId: string;

  @Column()
  customerConsent: string;

  @Column({ nullable: true })
  externalCustomerId: string;

  @Column({ nullable: true })
  paymentDate: Date;

  @Column({ nullable: true })
  paymentType: string;

  @CreateDateColumn({ readonly: true })
  createdAt: Date;

  @UpdateDateColumn({ readonly: true })
  updatedAt: Date;

  @ManyToOne(() => User, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
    nullable: true,
  })
  user?: User;

  @Column({ nullable: true })
  userId: string;
}
