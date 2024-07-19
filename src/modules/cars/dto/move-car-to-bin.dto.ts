import { IsArray } from 'class-validator';

export class MoveCarToBinDto {
  @IsArray()
  ids: number[];
}
