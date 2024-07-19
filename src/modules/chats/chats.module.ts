import { Module, forwardRef } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { ChatsController } from './chats.controller';
import { FirebaseModule } from '../firebase/firebase.module';
import { UsersModule } from '../users/users.module';
import { CarsModule } from '../cars/cars.module';
import { S3FileService } from '@/services';
import { ChatConsumer } from './consumers/chat.consumer';
import { ChatProducer } from './producers/chat.producer';
import { BullModule } from '@nestjs/bull';
import { CHAT_QUEUE } from './chats.constant';
import { ThaiBulkSmsService } from '@/services/thaibulksms.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    HttpModule,
    BullModule.registerQueue({ name: CHAT_QUEUE }),
    FirebaseModule,
    forwardRef(() => CarsModule),
    forwardRef(() => UsersModule),
  ],
  controllers: [ChatsController],
  providers: [
    ChatsService,
    S3FileService,
    ChatConsumer,
    ChatProducer,
    ThaiBulkSmsService,
  ],
  exports: [ChatProducer],
})
export class ChatsModule {}
