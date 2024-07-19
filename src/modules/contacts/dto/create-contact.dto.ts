import { ContactEnum } from '@/common/enums/contact.enum';
import { IsEmail, IsEnum, IsNotEmpty } from 'class-validator';

export class CreateContactDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  firstName: string;

  @IsNotEmpty()
  lastName: string;

  @IsNotEmpty()
  message: string;

  @IsNotEmpty()
  @IsEnum(ContactEnum)
  topic: ContactEnum;
}
