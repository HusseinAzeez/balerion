import { UserRejectionLog } from '../../db/entities/user-rejection-log.entity';
import { Module } from '@nestjs/common';
import { StaffsService } from './staffs.service';
import { StaffsController } from './staffs.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Staff } from '@/db/entities/staff.entity';
import { S3FileService } from '@/services/s3-file.service';
import { CarsModule } from '../cars/cars.module';
import { PaginationsService } from '../paginations/paginations.service';
import { User } from '@/db/entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from '../auth/constants';
import { EmailModule } from '../email/email.module';
import { VouchersModule } from '../vouchers/vouchers.module';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Staff, User, UserRejectionLog]),
    JwtModule.register({
      secret: jwtConstants.secret,
    }),
    CarsModule,
    EmailModule,
    VouchersModule,
    UsersModule,
    AuthModule,
    NotificationsModule,
  ],
  controllers: [StaffsController],
  providers: [StaffsService, S3FileService, PaginationsService],
})
export class StaffsModule {}
