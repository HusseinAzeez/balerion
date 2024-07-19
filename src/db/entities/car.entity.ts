import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
  DeleteDateColumn,
  RelationId,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';

import { ColumnNumericTransformer } from '@/common/transformers/column-numeric.transformer';
import { User } from './user.entity';
import { CarBrand } from './car-brand.entity';
import { CarEquipment } from './car-equipment.entity';
import { CarModel } from './car-model.entity';
import { CarSubModel } from './car-sub-model.entity';
import { CarBodyType } from './car-body-type.entity';
import { CarFuelType } from './car-fuel-type.entity';
import { CarTransmission } from './car-transmission.entity';
import {
  CarStatus,
  CarOwnership,
  CarColor,
  CarSoldOnPlatform,
} from '@/common/enums/car.enum';
import { CarLifestyle } from './car-lifestyle.entity';
import { CarEngine } from './car-engine.entity';
import { Attachment } from './attachment.entity';
import { Staff } from './staff.entity';
import { CmuCertifiedRequest } from './cmu-certified-request.entity';
import { AnalyticsView } from './analytics-view.entity';
import { AnalyticsClick } from './analytics-click.entity';
import { AnalyticsImpression } from './analytics-impression.entity';

@Entity('cars')
export class Car {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  uid: string;

  @Column({
    type: 'enum',
    enum: CarStatus,
    default: CarStatus.DRAFT,
  })
  status: CarStatus;

  @Column({
    type: 'enum',
    enum: CarOwnership,
    nullable: true,
  })
  ownership: CarOwnership;

  @Column({
    type: 'enum',
    enum: CarColor,
    default: CarColor.WHITE,
  })
  color: CarColor;

  @Column({ nullable: true })
  otherColor: string;

  @Column()
  mileage: number;

  @Column({ nullable: true })
  plateNumber: string;

  @Column({ default: false })
  gasInstallation: boolean;

  @Column()
  registeredYear: number;

  @Column()
  manufacturedYear: number;

  @Column()
  province: string;

  @Column()
  district: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  price: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    transformer: new ColumnNumericTransformer(),
  })
  discount: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
    default: 0,
  })
  totalPrice: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    transformer: new ColumnNumericTransformer(),
  })
  monthlyInstallment: number;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  reason: string;

  @Column({ nullable: true })
  videoUrl: string;

  @Column({ default: false })
  postOnSocialMedia: boolean;

  @Column({ default: false })
  isOther: boolean;

  @Column()
  userId: number;

  @ManyToOne(() => User, (user) => user.updatedCars, {
    nullable: true,
  })
  updatedByUser: User;

  @ManyToOne(() => Staff, (staff) => staff.updatedCars, {
    nullable: true,
  })
  updatedByStaff: Staff;

  @ManyToOne(() => Staff, (staff) => staff.publishedCars, {
    nullable: true,
  })
  publishedBy: Staff;

  @Column({ nullable: true })
  publishedAt: Date;

  @ManyToOne(() => User, (user) => user.deletedCars, {
    nullable: true,
  })
  deletedByUser: User;

  @ManyToOne(() => Staff, (staff) => staff.deletedCars, {
    nullable: true,
  })
  deletedByStaff: Staff;

  @ManyToOne(() => Staff, (staff) => staff.rejectedCars, {
    nullable: true,
  })
  rejectedBy: Staff;

  @Column({ nullable: true })
  rejectedAt: Date;

  @Column({ nullable: true })
  reservedAt: Date;

  @Column({ nullable: true })
  submittedAt: Date;

  @Column({ nullable: true })
  expiredAt: Date;

  @Column({ nullable: true })
  dumpAt: Date;

  @Column({ nullable: true })
  soldAt: Date;

  @Column({
    type: 'enum',
    enum: CarSoldOnPlatform,
    nullable: true,
  })
  soldOn: CarSoldOnPlatform;

  @Column({ nullable: true })
  soldOnOther: string;

  @Column({ nullable: true })
  hotDealedAt: Date;

  @Column({ nullable: true })
  bumpedAt: Date;

  @CreateDateColumn({ readonly: true })
  createdAt: Date;

  @UpdateDateColumn({ readonly: true })
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @ManyToOne(() => CarBrand, (carBrand) => carBrand.cars, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  brand: CarBrand;

  @Column()
  brandName: string;

  @ManyToOne(() => CarModel, (carModel) => carModel.cars, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  model: CarModel;

  @Column()
  modelName: string;

  @ManyToOne(() => CarSubModel, (carSubModel) => carSubModel.cars, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  subModel: CarSubModel;

  @Column()
  subModelName: string;

  @ManyToOne(() => CarBodyType, (carBodyType) => carBodyType.cars)
  bodyType: CarBodyType;

  @Column()
  bodyTypeName: string;

  @ManyToOne(() => CarFuelType, (carFuelType) => carFuelType.cars)
  fuelType: CarFuelType;

  @Column()
  fuelTypeName: string;

  @ManyToOne(() => CarTransmission, (carTransmission) => carTransmission.cars)
  transmission: CarTransmission;

  @Column()
  transmissionName: string;

  @ManyToOne(() => CarLifestyle, (carLifestyle) => carLifestyle.cars)
  lifestyle: CarTransmission;

  @Column()
  lifestyleName: string;

  @ManyToOne(() => CarEngine, (carEngine) => carEngine.cars)
  engine: CarEngine;

  @Column()
  engineName: string;

  @ManyToOne(() => User, (user) => user.cars)
  user: User;

  @ManyToMany(() => CarEquipment, (carEquipment) => carEquipment.cars)
  @JoinTable({ name: 'cars_car_equipments' })
  equipments: CarEquipment[];

  @RelationId((car: Car) => car.equipments)
  equipmentList: string[];

  @OneToMany(() => Attachment, (attachment) => attachment.car, {
    cascade: true,
  })
  attachments: Attachment[];

  @OneToOne(
    () => CmuCertifiedRequest,
    (cmuCertifiedRequest) => cmuCertifiedRequest.car,
    { cascade: true },
  )
  cmuCertifiedRequest: CmuCertifiedRequest;

  @Column({ default: true })
  isCurrentVersion: boolean;

  @Column({ default: false })
  isUnderRevision: boolean;

  @OneToOne(() => Car, {
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  })
  @JoinColumn()
  newVersion: Car;

  @Column({ unique: true, nullable: true })
  car4sureId: string;

  @Column({ default: false })
  isMigrated: boolean;

  @Column({ default: false })
  isCarsmeupCertified: boolean;

  @Column({ default: false })
  isHotDealed: boolean;

  @Column({ default: false })
  isBumped: boolean;

  @OneToMany(() => AnalyticsView, (analyticsViews) => analyticsViews.car)
  views: AnalyticsView[];

  @OneToMany(() => AnalyticsClick, (analyticsClick) => analyticsClick.car)
  clicks: AnalyticsClick[];

  @OneToMany(
    () => AnalyticsImpression,
    (analyticsImpression) => analyticsImpression.car,
  )
  impressions: AnalyticsImpression[];

  @Column({ default: false })
  willHaveHotDeal: boolean;

  @Column({ default: false })
  willHaveBump: boolean;

  @Column({ default: false })
  willHaveCMUCertified: boolean;
}
