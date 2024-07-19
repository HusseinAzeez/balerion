import { IsNotEmpty, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateUserDto {
  @IsNotEmpty()
  firstName: string;

  @IsNotEmpty()
  lastName: string;

  phoneNumber: string;

  @Transform(({ value }) => value === 'true' || value === true)
  deleteImage = false;

  lineId: string;

  club: string;

  province: string;

  district: string;

  zipCode: string;

  @IsOptional()
  postLimit?: number;
}
