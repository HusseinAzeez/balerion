import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { CarColor, CarOwnership, CarStatus } from '@/common/enums/car.enum';
import { Transform, Type } from 'class-transformer';
import { AttachmentDto } from './create-car-by-user.dto';
import { Attachment } from '@/db/entities/attachment.entity';

export class UpdateCarByUserDto {
  @IsNotEmpty()
  brandName: string;

  @IsNotEmpty()
  modelName: string;

  @IsNotEmpty()
  manufacturedYear: number;

  @IsNotEmpty()
  subModelName: string;

  @IsNotEmpty()
  transmissionName?: string;

  @IsNotEmpty()
  bodyTypeName?: string;

  @IsNotEmpty()
  fuelTypeName?: string;

  engineName?: string;

  lifestyleName?: string;

  @IsEnum({
    draft: CarStatus.DRAFT,
    pending_approval: CarStatus.PENDING_APPROVAL,
    pending_edit_approval: CarStatus.PENDING_EDIT_APPROVAL,
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

  plateNumber?: string;

  gasInstallation?: boolean;

  @IsNotEmpty()
  registeredYear?: number;

  @IsNotEmpty()
  province: string;

  district?: string;

  @IsNotEmpty()
  price: number;

  discount?: number;

  description?: string;

  videoUrl?: string;

  @Transform(({ value }) => value === 'true' || value === true)
  isOther? = false;

  @Transform(({ value }) => value === 'true' || value === true)
  willHaveBump = false;

  @Transform(({ value }) => value === 'true' || value === true)
  willHaveHotDeal = false;

  @Transform(({ value }) => value === 'true' || value === true)
  willHaveCMUCertified = false;

  @IsArray()
  @IsOptional()
  equipmentList: string[];

  @ValidateNested()
  @Type(() => AttachmentDto)
  attachments: Attachment[];
}
