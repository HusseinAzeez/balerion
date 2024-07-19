import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

import { CarColor, CarOwnership, CarStatus } from '@/common/enums/car.enum';
import { Attachment } from '@/db/entities/attachment.entity';
import {
  AttachmentType,
  AttachmentTypeCar,
} from '@/common/enums/attachment.enum';

export class CreateCarByStaffDto {
  @IsNotEmpty()
  userId: number;

  @IsNotEmpty()
  brandName: string;

  @IsNotEmpty()
  modelName: string;

  @IsNotEmpty()
  manufacturedYear: number;

  @IsNotEmpty()
  subModelName: string;

  @IsNotEmpty()
  transmissionName: string;

  @IsNotEmpty()
  bodyTypeName: string;

  @IsNotEmpty()
  fuelTypeName: string;

  engineName: string;

  lifestyleName: string;

  @IsEnum({
    draft: CarStatus.DRAFT,
    published: CarStatus.PUBLISHED,
  })
  status: CarStatus;

  @IsEnum(CarOwnership)
  @IsOptional()
  ownership: CarOwnership;

  @IsEnum(CarColor)
  color: CarColor;

  @ValidateIf((o) => o.color === CarColor.OTHERS)
  @IsString()
  otherColor?: string;

  @IsNotEmpty()
  mileage: number;

  plateNumber: string;

  gasInstallation: boolean;

  @IsNotEmpty()
  registeredYear: number;

  @IsNotEmpty()
  province: string;

  district: string;

  @IsNotEmpty()
  price: number;

  discount: number;

  description: string;

  @Transform(({ value }) => value === 'true' || value === true)
  isOther = false;

  @Transform(({ value }) => value === 'true' || value === true)
  postOnSocialMedia = false;

  videoUrl?: string;

  @IsArray()
  @IsOptional()
  equipmentList: string[];

  @IsArray()
  @IsOptional()
  @ValidateNested()
  @Type(() => AttachmentDto)
  attachments: Attachment[];
}

export class AttachmentDto {
  id?: number;

  @IsNotEmpty()
  filename: string;

  @IsNotEmpty()
  extension: string;

  @IsNotEmpty()
  size: number;

  @IsNotEmpty()
  url: string;

  @IsEnum(AttachmentTypeCar)
  attachmentType: AttachmentType;

  @IsOptional()
  @IsNumber()
  sequence?: number;
}
