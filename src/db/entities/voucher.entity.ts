import { VoucherStatus, VoucherType } from '@/common/enums/voucher.enum';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CmuCertifiedRequest } from './cmu-certified-request.entity';
import { VoucherDetail } from './voucher-detail.entity';
import { User } from './user.entity';

@Entity('vouchers')
export class Voucher {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  userId?: number;

  @Column({ unique: true })
  uid: string;

  @Column({ nullable: true })
  activatedAt: Date;

  @Column({ nullable: true })
  redeemedAt: Date;

  @Column({ nullable: true })
  usedAt: Date;

  @Column({ nullable: true })
  expiredAt: Date;

  @CreateDateColumn({ readonly: true })
  createdAt: Date;

  @UpdateDateColumn({ readonly: true })
  updatedAt: Date;

  @DeleteDateColumn({ readonly: true })
  deletedAt: Date;

  @Column({
    type: 'enum',
    enum: VoucherStatus,
    default: VoucherStatus.AVAILABLE,
  })
  status: VoucherStatus;

  @Column({
    type: 'enum',
    enum: VoucherType,
    default: VoucherType.CARSMEUP_CERTIFIED,
  })
  voucherType: VoucherType;

  @OneToOne(
    () => CmuCertifiedRequest,
    (cmeCertifiedRequest) => cmeCertifiedRequest.voucher,
  )
  cmuCertifiedRequest?: CmuCertifiedRequest;

  @OneToOne(() => VoucherDetail, (voucherDetail) => voucherDetail.voucher, {
    cascade: true,
  })
  voucherDetail: VoucherDetail;

  @ManyToOne(() => User, { nullable: true })
  user?: User;
}
