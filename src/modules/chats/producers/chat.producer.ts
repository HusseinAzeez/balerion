import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { IChatCar, IChatUser } from '@/common/interfaces/chat.interface';
import { CHAT_QUEUE } from '../chats.constant';

@Injectable()
export class ChatProducer {
  constructor(@InjectQueue(CHAT_QUEUE) private chatQueue: Queue) {}

  async queueUpUpdateCarJob(car: IChatCar) {
    const jobId = `car-${car.uid}`;
    await this.chatQueue.add('update-car', car, { jobId });
  }

  async queueUpUpdateUserJob(user: IChatUser) {
    const jobId = `user-${user.id}`;
    await this.chatQueue.add('update-user', user, { jobId });
  }
}
