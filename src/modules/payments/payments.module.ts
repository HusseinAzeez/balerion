import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { StripeService } from '@/services';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@/db/entities/user.entity';
import { ProductPrice } from '@/db/entities/product-price.entity';
import { ServicePrice } from '@/db/entities/service-price.entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, ProductPrice, ServicePrice]),
    NotificationsModule,
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService, StripeService],
})
export class PaymentsModule {}
