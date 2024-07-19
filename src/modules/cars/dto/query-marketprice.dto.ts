import { IsNotEmpty } from 'class-validator';

export class QueryMarketpriceDto {
  @IsNotEmpty()
  subModelName: string;

  @IsNotEmpty()
  manufacturedYear: number;
}
