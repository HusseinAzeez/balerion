import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '@/db/entities/user.entity';
import { UserSubscriber } from '@/db/subscribers/user.subscriber';
import { S3FileService, StripeService } from '@/services';
import { PaginationsService } from '../paginations/paginations.service';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from '../auth/constants';
import { CarsModule } from '../cars/cars.module';
import { Attachment } from '@/db/entities/attachment.entity';
import { ChatsModule } from '../chats/chats.module';
import { SaveCarsModule } from '../save-cars/save-cars.module';
import { EmailModule } from '../email/email.module';
import { VouchersModule } from '../vouchers/vouchers.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Attachment]),
    JwtModule.register({
      secret: jwtConstants.secret,
    }),
    forwardRef(() => CarsModule),
    forwardRef(() => ChatsModule),
    SaveCarsModule,
    EmailModule,
    VouchersModule,
    NotificationsModule,
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    UserSubscriber,
    S3FileService,
    PaginationsService,
    StripeService,
  ],
  exports: [UsersService],
})
export class UsersModule {}
