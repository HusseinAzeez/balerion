import { Module } from '@nestjs/common';
import { CmuCertifiedRequestsService } from './cmu-certified-requests.service';
import { CmuCertifiedRequestsController } from './cmu-certified-requests.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@/db/entities/user.entity';
import { Attachment } from '@/db/entities/attachment.entity';
import { CmuCertifiedRequest } from '@/db/entities/cmu-certified-request.entity';
import { Car } from '@/db/entities/car.entity';
import { Staff } from '@/db/entities/staff.entity';
import { PaginationsService } from '../paginations/paginations.service';
import { S3FileService } from '@/services';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from '../auth/constants';
import { EmailModule } from '../email/email.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { VouchersModule } from '../vouchers/vouchers.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Attachment,
      Car,
      CmuCertifiedRequest,
      Staff,
    ]),
    JwtModule.register({
      secret: jwtConstants.secret,
    }),
    EmailModule,
    NotificationsModule,
    VouchersModule,
  ],

  controllers: [CmuCertifiedRequestsController],
  providers: [CmuCertifiedRequestsService, PaginationsService, S3FileService],
})
export class CmuCertifiedRequestsModule {}
