import { IsArray } from 'class-validator';

export class ApplyHotDealDto {
  @IsArray()
  carIds: number[];
}
