import { Injectable } from '@nestjs/common';
import { UsersService } from '@/modules/users/users.service';

@Injectable()
export class AppService {
  constructor(private readonly usersService: UsersService) {}

  getHello(): string {
    return 'Carsmeup APIs are up and running...';
  }

  async getProfile(currentUserId?: number) {
    return await this.usersService.profile(currentUserId);
  }
}
