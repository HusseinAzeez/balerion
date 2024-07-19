import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, ValidateNested } from 'class-validator';

export class CreateCmuCertifiedRequestDto {
  @IsArray()
  @ValidateNested()
  @Type(() => CmuCertifiedCarDetail)
  carDetails: CmuCertifiedCarDetail[];
}

export class CmuCertifiedCarDetail {
  @IsNotEmpty()
  carId: number;

  @IsNotEmpty()
  plateNumber: string;
}
