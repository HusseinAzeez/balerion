import { Process, Processor } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bull';
import { ChatProducer } from '../producers/chat.producer';
import { ChatsService } from '../chats.service';
import { IChatCar, IChatUser } from '@/common/interfaces/chat.interface';
import { CHAT_QUEUE } from '../chats.constant';

@Injectable()
@Processor(CHAT_QUEUE)
export class ChatConsumer {
  private readonly logger = new Logger(ChatProducer.name);

  constructor(private readonly chatService: ChatsService) {}

  @Process('update-car')
  async handleUpdateCar(job: Job<IChatCar>) {
    this.logger.log('RUNNER: Start update car', job.data.uid);
    await this.chatService.updateCar(job.data);
    this.logger.log('RUNNER: End update car');
  }

  @Process('update-user')
  async handleUpdateUser(job: Job<IChatUser>) {
    this.logger.log('RUNNER: Start update user', job.data);
    await this.chatService.updateUser(job.data);
    this.logger.log('RUNNER: End update user');
  }
}
