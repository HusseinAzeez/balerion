import { IsDateString, IsOptional } from 'class-validator';

export class QueryRescheduleBanner {
  @IsOptional()
  @IsDateString()
  scheduleAt: Date;
}
