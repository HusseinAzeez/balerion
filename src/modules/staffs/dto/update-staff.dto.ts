import { Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';

export class UpdateStaffDto {
  @IsOptional()
  firstName: string;

  @IsOptional()
  lastName: string;

  @IsOptional()
  phoneNumber: string;

  @Transform(({ value }) => value === 'true' || value === true)
  deleteImage = false;
}
