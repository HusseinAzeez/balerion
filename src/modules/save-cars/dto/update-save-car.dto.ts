import { PartialType } from '@nestjs/swagger';
import { CreateSaveCarDto } from './create-save-car.dto';

export class UpdateSaveCarDto extends PartialType(CreateSaveCarDto) {}
