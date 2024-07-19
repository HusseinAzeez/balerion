import { BadRequestException, Injectable } from '@nestjs/common';
import { CarStatus } from '@/common/enums/car.enum';
import { ProductPriceType } from '@/common/enums/product-price.enum';
import { ServicePriceType } from '@/common/enums/service-price.enum';
import {
  NotificationSubType,
  NotificationType,
} from '@/common/enums/notification.enum';
import {
  ICreateCarDeletedNotification,
  ICreateCarExpiredNotification,
  ICreateCarNotification,
  ICreateCmuCertifiedNotification,
  ICreateNotificationDocDto,
  ICreateProductNotification,
  ICreateServiceNotification,
} from './notification.interface';
import { CmuCertifiedRequestStatus } from '@/common/enums/cmu-certified-request.enum';
import { FirebaseRepository } from '../firebase/firebase.repository';
import { NOTIFICATION_COLLECTION } from './notifications.constant';

@Injectable()
export class NotificationsService {
  constructor(private readonly firebaseRepository: FirebaseRepository) {}

  async create(createNotificationDto: ICreateNotificationDocDto) {
    const { userId } = createNotificationDto;
    const firestore = this.firebaseRepository.getFirestore();
    await firestore
      .collection(NOTIFICATION_COLLECTION)
      .doc(userId.toString())
      .collection('data')
      .doc()
      .set({ ...createNotificationDto, createdAt: new Date(), read: false });
  }

  async notificationIsExists(dto: ICreateNotificationDocDto): Promise<boolean> {
    const { subType, type, userId, carId } = dto;
    const firestore = this.firebaseRepository.getFirestore();
    const notification = await firestore
      .collection(NOTIFICATION_COLLECTION)
      .doc(userId.toString())
      .collection('data')
      .where('subType', '==', subType)
      .where('type', '==', type)
      .where('carId', '==', carId)
      .where('userId', '==', userId)
      .get();
    return !notification.empty;
  }

  async createCarNotification(input: ICreateCarNotification) {
    const { carId, userId, status, carInformation } = input;

    let subType: NotificationSubType;

    switch (status) {
      case CarStatus.PUBLISHED:
        subType = NotificationSubType.PUBLISHED;
        break;
      case CarStatus.NOT_APPROVED:
        subType = NotificationSubType.NOT_APPROVED;
        break;
      case CarStatus.ACTION_REQUIRED:
        subType = NotificationSubType.ACTION_REQUIRED;
        break;
      case CarStatus.NEED_ACTION:
        subType = NotificationSubType.NEED_ACTION;
        break;
      case CarStatus.EXPIRED:
        subType = NotificationSubType.EXPIRED;
        break;
      case CarStatus.DELETED:
        subType = NotificationSubType.DELETED;
        break;
    }

    await this.create({
      userId,
      carId,
      type: NotificationType.CAR,
      subType,
      carInformation,
    });
  }

  async createExpiredCarNotification(input: ICreateCarExpiredNotification) {
    const { carId, userId, carInformation, expiredAt } = input;
    const createNotificationDto = {
      carId,
      userId,
      type: NotificationType.CAR,
      subType: NotificationSubType.EXPIRED,
      carInformation,
      expiredAt,
    };
    const existNotification = await this.notificationIsExists(
      createNotificationDto,
    );
    if (!existNotification) await this.create(createNotificationDto);
  }

  async createDeletedCarNotification(input: ICreateCarDeletedNotification) {
    const { carId, userId, carInformation, dumpAt } = input;
    const createNotificationDto = {
      carId,
      userId,
      type: NotificationType.CAR,
      subType: NotificationSubType.DELETED,
      carInformation,
      dumpAt,
    };
    const existNotification = await this.notificationIsExists(
      createNotificationDto,
    );
    if (!existNotification) await this.create(createNotificationDto);
  }

  async createProductNotification(input: ICreateProductNotification) {
    const { userId, productType } = input;

    let type: NotificationType;

    switch (productType) {
      case ProductPriceType.BUMP:
        type = NotificationType.BUMP;
        break;
      case ProductPriceType.CARSMEUP_CERTIFIED:
        type = NotificationType.CARSMEUP_CERTIFIED;
        break;
      case ProductPriceType.HOT_DEAL:
        type = NotificationType.HOT_DEAL;
        break;
    }

    await this.create({
      userId,
      subType: NotificationSubType.PURCHASED,
      type,
    });
  }

  async createCMUCertifiedNotification(input: ICreateCmuCertifiedNotification) {
    const { userId, carId, status, carInformation } = input;

    let subType: NotificationSubType;

    switch (status) {
      case CmuCertifiedRequestStatus.APPROVED:
        subType = NotificationSubType.PUBLISHED;
        break;
      case CmuCertifiedRequestStatus.ON_HOLD:
        subType = NotificationSubType.NOT_APPROVED;
        break;
    }

    await this.create({
      userId,
      carId,
      type: NotificationType.CARSMEUP_CERTIFIED,
      subType,
      carInformation,
    });
  }

  async createServiceNotification(input: ICreateServiceNotification) {
    const { userId, serviceType } = input;

    let type: NotificationType;

    switch (serviceType) {
      case ServicePriceType.B_QUIK_BENZINE:
        type = NotificationType.B_QUIK_BENZINE;
        break;
      case ServicePriceType.B_QUIK_DIESEL:
        type = NotificationType.B_QUIK_DIESEL;
        break;
      case ServicePriceType.ROADSIDE_ASSIST:
        type = NotificationType.ROADSIDE_ASSIST;
        break;
    }

    await this.create({
      userId,
      subType: NotificationSubType.PURCHASED,
      type,
    });
  }

  async markAllAsRead(currentUserId: number) {
    const firestore = this.firebaseRepository.getFirestore();
    const collection = firestore
      .collection(NOTIFICATION_COLLECTION)
      .doc(currentUserId.toString())
      .collection('data');
    const refDoc = await collection.where('read', '==', false).get();
    const batch = firestore.batch();
    for (const doc of refDoc.docs) {
      const docRef = collection.doc(doc.id);
      batch.update(docRef, { read: true });
    }
    try {
      await batch.commit();
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async setRead(id: string, currentUserId: number) {
    const firestore = this.firebaseRepository.getFirestore();

    try {
      await firestore
        .collection(NOTIFICATION_COLLECTION)
        .doc(currentUserId.toString())
        .collection('data')
        .doc(id)
        .update({ read: true });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
