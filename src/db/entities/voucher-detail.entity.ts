import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Voucher } from './voucher.entity';
import { Attachment } from './attachment.entity';

@Entity('voucher_details')
export class VoucherDetail {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  voucherId: number;

  @Column()
  carBrand: string;

  @Column()
  carModel: string;

  @Column({ nullable: true })
  carSubModel?: string;

  @Column({ nullable: true })
  carManufacturedYear?: number;

  @Column()
  carInformation: string;

  @Column()
  carPlateNumber: string;

  @Column()
  ownerFirstName: string;

  @Column()
  ownerLastName: string;

  @Column()
  ownerFullName: string;

  @Column()
  ownerPhoneNumber: string;

  @Column({ nullable: true })
  ownerEmail: string;

  @OneToOne(() => Voucher, { onUpdate: 'CASCADE', onDelete: 'CASCADE' })
  @JoinColumn()
  voucher: Voucher;

  @OneToMany(() => Attachment, (attachment) => attachment.voucherDetail, {
    cascade: true,
  })
  attachments: Attachment[];
}
