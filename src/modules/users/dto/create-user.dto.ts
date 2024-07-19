import { IsNotEmpty } from 'class-validator';

export class CreateUsersDto {
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  firstName: string;

  @IsNotEmpty()
  lastName: string;

  phoneNumber: string;
}
