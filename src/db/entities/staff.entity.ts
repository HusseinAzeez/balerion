import { StaffRole, StaffStatus } from '@/common/enums/staff.eum';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Car } from './car.entity';
import { CmuCertifiedRequest } from './cmu-certified-request.entity';
import { Report } from './report.entity';
import { UserRejectionLog } from './user-rejection-log.entity';
import { User } from './user.entity';

@Entity('staffs')
export class Staff {
  @PrimaryGeneratedColumn()
  id: number;

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

  @Column({
    type: 'enum',
    enum: StaffStatus,
    default: StaffStatus.INVITED,
  })
  status: StaffStatus;

  @Column({
    type: 'enum',
    enum: StaffRole,
    default: StaffRole.SUPER_ADMIN,
  })
  role: StaffRole;

  @CreateDateColumn({ readonly: true })
  createdAt: Date;

  @UpdateDateColumn({ readonly: true })
  updatedAt: Date;

  @DeleteDateColumn({ readonly: true })
  deletedAt: Date;

  @Column({ nullable: true })
  profileImageUrl?: string;

  @Column({ nullable: true })
  resetPasswordToken?: string;

  @Column({ nullable: true })
  resetPasswordExpiredAt?: Date;

  @Column({ nullable: true })
  inviteToken?: string;

  @Column({ nullable: true })
  inviteTokenExpiredAt?: Date;

  @Column({ nullable: true })
  verifiedToken?: string;

  @Column({ nullable: true })
  verifiedAt?: Date;

  @Column({ nullable: true })
  hashedRefreshToken?: string;

  @Column({ nullable: true })
  lastSignInAt?: Date;

  @Column({ nullable: true })
  otp?: string;

  @Column({ nullable: true })
  otpRefNo?: string;

  @Column({ nullable: true })
  otpExpiredAt?: Date;

  @OneToMany(() => Car, (car) => car.updatedByStaff)
  updatedCars: Car[];

  @OneToMany(() => Car, (car) => car.deletedByStaff)
  deletedCars: Car[];

  @OneToMany(() => Car, (car) => car.rejectedBy)
  rejectedCars: Car[];

  @OneToMany(() => Car, (car) => car.publishedBy)
  publishedCars: Car[];

  @ManyToOne(() => Staff, (staff) => staff.id, { nullable: true })
  invitedBy?: Staff;

  @OneToMany(() => User, (user) => user.approvedBy)
  approvedUsers: User[];

  @OneToMany(
    () => UserRejectionLog,
    (UserRejectionLog) => UserRejectionLog.rejectedBy,
  )
  rejectedUsers: UserRejectionLog;

  @OneToMany(
    () => CmuCertifiedRequest,
    (cmuCertifiedRequest) => cmuCertifiedRequest.reviewedBy,
  )
  cmuCertifiedRequests: CmuCertifiedRequest[];

  @OneToMany(() => Report, (report) => report.staff)
  reports: Report[];
}
