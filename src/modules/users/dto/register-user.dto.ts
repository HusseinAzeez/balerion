import { Transform } from 'class-transformer';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { UserRole } from './../../../common/enums/user.enum';

export class RegisterUserDto {
  @IsNotEmpty()
  firstName: string;

  @IsNotEmpty()
  lastName: string;

  @IsOptional()
  phoneNumber?: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @Transform(({ value }) => value === 'true' || value === true)
  isNewsLetter?: false;

  @IsEnum(UserRole)
  @IsNotEmpty()
  role: UserRole;

  @IsOptional()
  dealerName?: string;

  @IsOptional()
  taxId?: string;

  @IsOptional()
  idCard?: string;
}
