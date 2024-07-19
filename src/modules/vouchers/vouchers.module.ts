import { Module } from '@nestjs/common';
import { VouchersService } from './vouchers.service';
import { VouchersController } from './vouchers.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Voucher } from '@/db/entities/voucher.entity';
import { User } from '@/db/entities/user.entity';
import { Car } from '@/db/entities/car.entity';
import { CmuCertifiedRequest } from '@/db/entities/cmu-certified-request.entity';
import { VoucherSubscriber } from '@/db/subscribers/voucher.subscriber';
import { EmailModule } from '../email/email.module';
import { PaginationsService } from '../paginations/paginations.service';
import { S3FileService } from '@/services';
import { Attachment } from '@/db/entities/attachment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Voucher,
      User,
      Car,
      CmuCertifiedRequest,
      Attachment,
    ]),
    EmailModule,
  ],
  controllers: [VouchersController],
  providers: [
    VouchersService,
    VoucherSubscriber,
    PaginationsService,
    S3FileService,
  ],
  exports: [VouchersService],
})
export class VouchersModule {}
