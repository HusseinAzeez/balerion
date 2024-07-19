import { IsOptional, IsString } from 'class-validator';

export class CreateChatDto {
  @IsString()
  @IsOptional()
  message?: string | undefined;

  @IsString()
  chatId: string;
}
