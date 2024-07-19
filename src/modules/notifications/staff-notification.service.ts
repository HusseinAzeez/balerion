import { BadRequestException, Injectable } from '@nestjs/common';
import { FirebaseRepository } from '../firebase/firebase.repository';
import {
  ICreateStaffDealerNotification,
  ICreateStaffNotification,
} from './notification.interface';
import {
  StaffNotificationSubType,
  StaffNotificationType,
} from '@/common/enums/notification.enum';
import { STAFF_NOTIFICATION_COLLECTION } from './notifications.constant';

@Injectable()
export class StaffNotificationsService {
  constructor(private readonly firebaseRepository: FirebaseRepository) {}

  async create(input: ICreateStaffNotification) {
    const firestore = this.firebaseRepository.getFirestore();
    await firestore
      .collection(STAFF_NOTIFICATION_COLLECTION)
      .doc()
      .set({ ...input, createdAt: new Date(), read: false });
  }

  async update(id: string, data: { read: true }) {
    const firestore = this.firebaseRepository.getFirestore();
    try {
      await firestore
        .collection(STAFF_NOTIFICATION_COLLECTION)
        .doc(id)
        .update(data);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async createDealerNotification(input: ICreateStaffDealerNotification) {
    const { name, userId } = input;
    await this.create({
      name,
      userId,
      type: StaffNotificationType.DEALER,
      subType: StaffNotificationSubType.REQUESTED,
    });
  }

  async setRead(id: string) {
    await this.update(id, { read: true });
  }

  async markAllAsRead() {
    const firestore = this.firebaseRepository.getFirestore();
    const collection = firestore.collection(STAFF_NOTIFICATION_COLLECTION);
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
}
