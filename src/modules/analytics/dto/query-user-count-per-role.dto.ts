import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString } from 'class-validator';

export class QueryUserCountPerRoleDto {
  @ApiProperty({
    description: 'Filter user stats by start date',
  })
  @IsDateString()
  @IsOptional()
  startDate: string;

  @ApiProperty({
    description: 'Filter user stats by end date',
  })
  @IsDateString()
  @IsOptional()
  endDate: string;

  @ApiProperty({
    description: 'Filter user stats province',
  })
  @IsString()
  @IsOptional()
  province: string;
}
