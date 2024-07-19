import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { UserStatus } from '@/common/enums/user.enum';
import { Transform, Type } from 'class-transformer';
import { UpdateAttachmentUserDto } from './update-user-by-staff.dto';
import { Attachment } from '@/db/entities/attachment.entity';

export class UpdateUserDto {
  @IsNotEmpty()
  firstName: string;

  @IsNotEmpty()
  lastName: string;

  phoneNumber: string;

  status: UserStatus;

  @Transform(({ value }) => value === 'true' || value === true)
  deleteImage = false;

  lineId: string;

  idCard: string;

  province: string;

  district: string;

  zipCode: string;

  @IsOptional()
  @IsString()
  club?: string;

  @IsOptional()
  @ValidateNested()
  @IsArray()
  @Type(() => UpdateAttachmentUserDto)
  attachments?: Attachment[];
}
