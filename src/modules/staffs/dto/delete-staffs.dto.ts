import { IsArray } from 'class-validator';

export class DeleteStaffDto {
  @IsArray()
  ids: number[];
}
