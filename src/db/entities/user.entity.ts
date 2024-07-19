import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm';

import {
  UserAuthProvider,
  UserRole,
  UserStatus,
} from '@/common/enums/user.enum';
import { Report } from './report.entity';
import { Car } from './car.entity';
import { Staff } from './staff.entity';
import { Attachment } from './attachment.entity';
import { UserRejectionLog } from './user-rejection-log.entity';
import { CmuCertifiedRequest } from './cmu-certified-request.entity';
import { AuthenticationProvider } from './authentication-provider.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  uid: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true, select: false })
  password: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: true })
  phoneNumber?: string;

  @Column({ nullable: true })
  verifiedPhoneNumber?: string;

  @Column({ nullable: true })
  verifiedPhoneNumberToken?: string;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.PENDING,
  })
  status: UserStatus;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.PRIVATE,
  })
  role: UserRole;

  @Column({ nullable: true })
  hashedRefreshToken: string;

  @Column({ type: 'timestamp', nullable: true })
  lastSignInAt: Date;

  @CreateDateColumn({ readonly: true })
  createdAt: Date;

  @UpdateDateColumn({ readonly: true })
  updatedAt: Date;

  @DeleteDateColumn({ readonly: true })
  deletedAt: Date;

  @Column({ default: false })
  isNewsLetter: boolean;

  @Column({ nullable: true })
  dealerName?: string;

  @Column({ nullable: true })
  taxId?: string;

  @Column({ nullable: true })
  idCard?: string;

  @Column({ default: 0 })
  postLimit?: number;

  @Column({ nullable: true })
  lineId?: string;

  @Column({ nullable: true })
  club?: string;

  @Column({ nullable: true })
  profileImageUrl?: string;

  @Column({ nullable: true })
  resetPasswordToken: string;

  @Column({ nullable: true })
  resetPasswordExpiredAt: Date;

  @Column({ nullable: true })
  inviteToken: string;

  @Column({ nullable: true })
  inviteTokenExpiredAt: Date;

  @Column({ nullable: true })
  verifiedToken: string;

  @Column({ nullable: true })
  verifiedAt: Date;

  @Column({ nullable: true })
  province?: string;

  @Column({ nullable: true })
  district?: string;

  @Column({ nullable: true })
  zipCode?: string;

  @Column({ nullable: true })
  stripeId?: string;

  @OneToMany(() => Attachment, (attachment) => attachment.user, {
    cascade: true,
  })
  attachments?: Attachment[];

  @OneToMany(() => Report, (report) => report.user)
  reports: Report[];

  @OneToMany(() => Car, (car) => car.user)
  cars: Car[];

  @OneToMany(() => Car, (car) => car.updatedByUser)
  updatedCars: Car[];

  @OneToMany(() => Car, (car) => car.deletedByUser)
  deletedCars: Car[];

  @ManyToOne(() => Staff, (staff) => staff.id, { nullable: true })
  approvedBy?: Staff;

  @OneToMany(
    () => UserRejectionLog,
    (UserRejectionLog) => UserRejectionLog.user,
  )
  rejectionReasons: UserRejectionLog;

  @OneToMany(
    () => AuthenticationProvider,
    (authenticationProvider) => authenticationProvider.user,
    {
      cascade: true,
    },
  )
  authenticationProviders: AuthenticationProvider[];

  @Column({ default: 0 })
  hotDealBalance: number;

  @Column({ default: 0 })
  bumpBalance: number;

  @Column({ default: 0 })
  carsmeupCertifiedBalance: number;

  @Column({ default: 0 })
  roadsideAssistBalance: number;

  @Column({ default: 0 })
  bquikBenzineBalance: number;

  @Column({ default: 0 })
  bquikDieselBalance: number;

  @OneToMany(
    () => CmuCertifiedRequest,
    (cmuCertifiedRequest) => cmuCertifiedRequest.requestedBy,
  )
  cmuCertifiedRequests: CmuCertifiedRequest[];

  @Column({ unique: true, nullable: true })
  car4sureId: string;

  @Column({ default: false })
  isMigrated: boolean;

  @Column({
    type: 'enum',
    enum: UserAuthProvider,
    default: UserAuthProvider.EMAIL,
  })
  firstAuthProvider: UserAuthProvider;
}
