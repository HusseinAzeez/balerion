import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
  Get,
  Param,
} from '@nestjs/common';
import { ChatsService } from './chats.service';
import { CreateChatRoomDto } from './dto/create-chat-room.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiTags,
} from '@nestjs/swagger';
import { GetCurrentUserId } from '@/common/decorators';
import { CreateChatDto } from './dto/create-chat.dto';
import { FilesInterceptor } from '@nestjs/platform-express/multer';
import { ImagesValidationPipe } from '@/common/validators';
import {
  CreateChatOkResponseSchema,
  CreateChatRoomOkResponseSchema,
  CreateChatSchema,
} from './chats.constant';

@ApiTags('Chats')
@Controller('chats')
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Post('/rooms')
  @ApiBearerAuth()
  @ApiCreatedResponse(CreateChatRoomOkResponseSchema)
  @ApiNotFoundResponse({
    description: 'User not found / Car 1 not found',
  })
  createRoom(
    @Body() createChatRoomDto: CreateChatRoomDto,
    @GetCurrentUserId() currentUserId: number,
  ) {
    return this.chatsService.createRoom(createChatRoomDto, currentUserId);
  }

  @Get('/rooms/:carId')
  @ApiBearerAuth()
  getChatRooms(
    @GetCurrentUserId() currentUserId: number,
    @Param('carId') carId: number,
  ) {
    return this.chatsService.getChatRooms(currentUserId, carId);
  }

  @Post()
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody(CreateChatSchema)
  @ApiCreatedResponse(CreateChatOkResponseSchema)
  @ApiNotFoundResponse({
    description: 'Chat room id#UI000001-ID000001-C2 is not found.',
  })
  @UseInterceptors(FilesInterceptor('images', 5))
  create(
    @UploadedFiles(new ImagesValidationPipe())
    images: Array<Express.Multer.File>,
    @Body() createChatDto: CreateChatDto,
    @GetCurrentUserId() currentUserId: number,
  ) {
    if (!createChatDto.message && !images?.length)
      throw new BadRequestException(
        'Message & Images must not be empty at the same time',
      );
    return this.chatsService.create({
      ...createChatDto,
      images,
      userId: currentUserId,
    });
  }
}
