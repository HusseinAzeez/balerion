import { IsArray } from 'class-validator';

export class DeleteCarDto {
  @IsArray()
  ids: number[];
}
