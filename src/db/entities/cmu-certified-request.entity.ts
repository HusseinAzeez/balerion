import {
  CmuCertifiedRequestStatus,
  CmuCertifiedReviewStatus,
} from '@/common/enums/cmu-certified-request.enum';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Attachment } from './attachment.entity';
import { Car } from './car.entity';
import { Voucher } from './voucher.entity';
import { User } from './user.entity';
import { Staff } from './staff.entity';

@Entity('cmu_certified_requests')
export class CmuCertifiedRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ readonly: true })
  createdAt: Date;

  @UpdateDateColumn({ readonly: true })
  updatedAt: Date;

  @DeleteDateColumn({ readonly: true })
  deletedAt: Date;

  @JoinColumn()
  @OneToOne(() => Car, (car) => car.cmuCertifiedRequest, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  car?: Car;

  @ManyToOne(() => User, (user) => user.cmuCertifiedRequests)
  requestedBy: User;

  @Column({ nullable: true })
  onHoldAt: Date;

  @Column({ nullable: true })
  approvedAt: Date;

  @Column({
    type: 'enum',
    enum: CmuCertifiedRequestStatus,
    default: CmuCertifiedRequestStatus.WAITING_APPROVAL,
  })
  status: CmuCertifiedRequestStatus;

  @Column({
    type: 'enum',
    enum: CmuCertifiedReviewStatus,
    nullable: true,
  })
  interior: CmuCertifiedReviewStatus;

  @Column({
    type: 'enum',
    enum: CmuCertifiedReviewStatus,
    nullable: true,
  })
  exterior: CmuCertifiedReviewStatus;

  @Column({
    type: 'enum',
    enum: CmuCertifiedReviewStatus,
    nullable: true,
  })
  engineCompartment: CmuCertifiedReviewStatus;

  @JoinColumn()
  @OneToOne(() => Attachment, (attachment) => attachment.cmuCertifiedRequest, {
    cascade: true,
  })
  attachment?: Attachment;

  @JoinColumn()
  @OneToOne(() => Voucher, (voucher) => voucher.cmuCertifiedRequest, {
    cascade: true,
    nullable: true,
  })
  voucher?: Voucher;

  @ManyToOne(() => Staff, (staff) => staff.cmuCertifiedRequests)
  reviewedBy: Staff;

  @Column({ nullable: true })
  onHoldReason: string;
}
