import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { StaffNotificationsService } from './staff-notification.service';
import { FirebaseModule } from '../firebase/firebase.module';

@Module({
  imports: [FirebaseModule],
  providers: [NotificationsService, StaffNotificationsService],
  exports: [NotificationsService, StaffNotificationsService],
})
export class NotificationsModule {}
