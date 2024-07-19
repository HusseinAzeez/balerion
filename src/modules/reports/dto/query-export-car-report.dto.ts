import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';

export class QueryExportCarReportDto {
  @ApiProperty({ description: 'Published starting date' })
  @IsDateString()
  @IsOptional()
  publishedAtStart?: string;

  @ApiProperty({ description: 'Published ending date' })
  @IsDateString()
  @IsOptional()
  publishedAtEnd?: string;
}
