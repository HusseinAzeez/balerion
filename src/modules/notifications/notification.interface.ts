import { CarStatus } from '@/common/enums/car.enum';
import { CmuCertifiedRequestStatus } from '@/common/enums/cmu-certified-request.enum';
import {
  NotificationSubType,
  NotificationType,
  StaffNotificationSubType,
  StaffNotificationType,
} from '@/common/enums/notification.enum';
import { ProductPriceType } from '@/common/enums/product-price.enum';
import { ServicePriceType } from '@/common/enums/service-price.enum';

export interface ICreateNotificationDocDto {
  type: NotificationType;

  subType: NotificationSubType;

  userId: number;

  carId?: number;

  carInformation?: string;

  expiredAt?: Date;

  dumpAt?: Date;
}
interface ICreateCarNotificationBase {
  carId: number;
  carInformation: string;
  userId: number;
}

export interface ICreateCarNotification extends ICreateCarNotificationBase {
  status: CarStatus;
}

export interface ICreateCarExpiredNotification
  extends ICreateCarNotificationBase {
  expiredAt: Date;
}

export interface ICreateCarDeletedNotification
  extends ICreateCarNotificationBase {
  dumpAt: Date;
}

export interface ICreateCmuCertifiedNotification {
  userId: number;
  carId: number;
  status: CmuCertifiedRequestStatus;
  carInformation: string;
}

export interface ICreateServiceNotification {
  userId: number;
  serviceType: ServicePriceType;
}

export interface ICreateProductNotification {
  userId: number;
  productType: ProductPriceType;
}

export interface ICreateStaffNotification {
  name: string;
  userId: number;
  type: StaffNotificationType;
  subType: StaffNotificationSubType;
}

export interface ICreateStaffDealerNotification {
  name: string;
  userId: number;
}
