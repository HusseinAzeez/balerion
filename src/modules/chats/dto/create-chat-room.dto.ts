import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateChatRoomDto {
  @IsString()
  @IsOptional()
  message: string;

  @IsNumber()
  carId: number;

  @IsNumber()
  interlocutorId: number;
}
