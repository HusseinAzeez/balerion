import { ContactEnum } from '@/common/enums/contact.enum';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('contacts')
export class Contact {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  message: string;

  @Column({
    type: 'enum',
    enum: ContactEnum,
    default: ContactEnum.FEEDBACK,
  })
  topic: ContactEnum;
}
