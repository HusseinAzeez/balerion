import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { ReportStatus, ReportType } from '@/common/enums/report.enum';
import { User } from './user.entity';
import { Staff } from './staff.entity';

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: ReportStatus,
    default: ReportStatus.PENDING,
  })
  status: ReportStatus;

  @Column({
    type: 'enum',
    enum: ReportType,
    default: ReportType.CAR,
  })
  reportType: ReportType;

  @Column({ nullable: true })
  errorMessage: string;

  @Column({ nullable: true })
  fileUrl: string;

  @Column({ nullable: true, default: 0 })
  fileSize: number;

  @Column({ nullable: true, default: 0 })
  rowCount: number;

  @Column({ unique: true, nullable: true })
  jobUid: string;

  @CreateDateColumn({ type: 'timestamp', readonly: true })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', readonly: true })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.reports)
  user: User;

  @ManyToOne(() => Staff, (staff) => staff.reports)
  staff: Staff;
}
