import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Staff } from './staff.entity';
import { User } from './user.entity';

@Entity('user_rejection_logs')
export class UserRejectionLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  reason: string;

  @ManyToOne(() => User, (user) => user.rejectionReasons)
  user?: User;

  @ManyToOne(() => Staff, (staff) => staff.rejectedUsers)
  rejectedBy?: Staff;

  @CreateDateColumn({ readonly: true })
  createdAt: Date;

  @UpdateDateColumn({ readonly: true })
  updatedAt: Date;
}
