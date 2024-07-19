import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class QuerySubModelDto {
  @ApiProperty({
    description: 'Filter sub models by model name',
  })
  @IsNotEmpty()
  modelName: string;

  @ApiProperty({
    description: 'Filter sub models by manufactured year',
  })
  @IsNotEmpty()
  manufacturedYear: number;

  @ApiProperty({
    description: 'ex. subModel.name',
  })
  sortBy?: string = 'subModel.name';

  @ApiProperty({
    description: 'ASC or DESC',
  })
  sortDirection?: string = 'ASC';
}
