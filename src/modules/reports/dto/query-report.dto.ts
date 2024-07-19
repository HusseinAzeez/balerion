import { ApiProperty } from '@nestjs/swagger';
import { PaginateDto } from '@/modules/paginations/dto/paginate.dto';
import { ReportStatus, ReportType } from '@/common/enums/report.enum';
import { IsDateString, IsEnum, IsOptional } from 'class-validator';

export class QueryReportDto extends PaginateDto {
  @ApiProperty({ description: 'Search by name' })
  search?: string;

  @ApiProperty({ enum: ReportStatus })
  @IsEnum(ReportStatus)
  @IsOptional()
  status?: ReportStatus;

  @ApiProperty({ enum: ReportType })
  @IsEnum(ReportType)
  @IsOptional()
  reportType?: ReportType;

  @ApiProperty({ description: 'Created starting date' })
  @IsDateString()
  @IsOptional()
  createdAtStart?: string;

  @ApiProperty({ description: 'Created ending date' })
  @IsDateString()
  @IsOptional()
  createdAtEnd?: string;

  @ApiProperty({
    description: 'ex. report.name, report.status, report.reportType etc.',
  })
  sortBy?: string = 'report.createdAt';

  @ApiProperty({ description: 'ASC or DESC' })
  sortDirection?: string = 'DESC';
}
