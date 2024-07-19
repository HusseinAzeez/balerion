import { IsArray } from 'class-validator';

export class ApplyBumpDto {
  @IsArray()
  carIds: number[];
}
