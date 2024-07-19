import { AttachmentType } from '@/common/enums/attachment.enum';
import { PaginateDto } from '@/modules/paginations/dto/paginate.dto';
import { IsEnum, IsOptional } from 'class-validator';

export class QuerySaveCarDto extends PaginateDto {
  @IsEnum(AttachmentType)
  @IsOptional()
  attachmentType?: AttachmentType = AttachmentType.EXTERIOR;
}
