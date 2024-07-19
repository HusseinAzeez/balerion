import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToOne,
} from 'typeorm';

import { Car } from './car.entity';
import { AttachmentType } from '@/common/enums/attachment.enum';
import { User } from './user.entity';
import { CmuCertifiedRequest } from './cmu-certified-request.entity';
import { VoucherDetail } from './voucher-detail.entity';

@Entity('attachments')
export class Attachment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  filename: string;

  @Column()
  extension: string;

  @Column({ nullable: true })
  size: number;

  @Column()
  url: string;

  @Column({
    type: 'enum',
    enum: AttachmentType,
    default: AttachmentType.OTHER,
  })
  attachmentType: AttachmentType;

  @Column({ nullable: true })
  sequence: number;

  @CreateDateColumn({ readonly: true })
  createdAt: Date;

  @UpdateDateColumn({ readonly: true })
  updatedAt: Date;

  @ManyToOne(() => Car, (car) => car.attachments, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
    orphanedRowAction: 'delete',
  })
  car: Car;

  @ManyToOne(() => User, (user) => user.attachments, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
    orphanedRowAction: 'delete',
  })
  user: User;

  @OneToOne(
    () => CmuCertifiedRequest,
    (cmuCertifiedRequest) => cmuCertifiedRequest.attachment,
    {
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
  )
  cmuCertifiedRequest: CmuCertifiedRequest;

  @ManyToOne(
    () => VoucherDetail,
    (voucherDetail) => voucherDetail.attachments,
    { onUpdate: 'CASCADE', onDelete: 'CASCADE', orphanedRowAction: 'delete' },
  )
  voucherDetail: VoucherDetail;
}
