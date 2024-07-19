import {
  AttachmentType,
  AttachmentTypeVoucherDetail,
} from '@/common/enums/attachment.enum';
import {
  VoucherType,
  VoucherTypeNonReviewable,
} from '@/common/enums/voucher.enum';
import { Attachment } from '@/db/entities/attachment.entity';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsString,
  ValidateIf,
  ValidateNested,
  registerDecorator,
  ValidationOptions,
  IsOptional,
  IsNumber,
} from 'class-validator';
import { isEqual } from 'lodash';

export function IsValidVoucherAttachments(
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isLongerThan',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(values: any[]) {
          const fileTypes = values.map((value) => value.attachmentType).sort();
          const expectedFileTypes = Object.values(AttachmentTypeVoucherDetail);
          return isEqual(fileTypes, expectedFileTypes);
        },
      },
    });
  };
}

export class CreateVoucherDto {
  @IsEnum(VoucherTypeNonReviewable)
  voucherType?: VoucherType;

  @IsString()
  @IsNotEmpty()
  carBrand?: string;

  @IsString()
  @IsNotEmpty()
  carModel?: string;

  @IsString()
  @IsNotEmpty()
  carPlateNumber?: string;

  @IsString()
  @IsNotEmpty()
  ownerFirstName?: string;

  @IsString()
  @IsNotEmpty()
  ownerLastName?: string;

  @ValidateIf((o) => o.voucherType === VoucherType.ROADSIDE_ASSIST)
  @IsString()
  @IsNotEmpty()
  ownerPhoneNumber?: string;

  @ValidateIf((o) => o.voucherType === VoucherType.ROADSIDE_ASSIST)
  @IsArray()
  @ValidateNested()
  @Type(() => AttachmentVoucherDto)
  @IsValidVoucherAttachments({
    message: `attachments must have be ${AttachmentType.EXTERIOR}, ${AttachmentType.INTERIOR} and ${AttachmentType.REGISTRATION_CARD}`,
  })
  attachments?: Attachment[];
}

class AttachmentVoucherDto {
  @IsNotEmpty()
  filename: string;

  @IsNotEmpty()
  extension: string;

  @IsNotEmpty()
  size: number;

  @IsNotEmpty()
  url: string;

  @IsEnum(AttachmentTypeVoucherDetail)
  attachmentType: AttachmentTypeVoucherDetail;

  @IsOptional()
  @IsNumber()
  sequence?: number;
}
