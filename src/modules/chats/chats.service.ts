import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import { FirebaseRepository } from '../firebase/firebase.repository';
import { UsersService } from '../users/users.service';
import { CarsService } from '../cars/cars.service';
import { CreateChatRoomDto } from './dto/create-chat-room.dto';
import {
  IChatCar,
  IChatPayload,
  IChatUser,
  ICreateChat,
  ICreateChatRoom,
  ISendChat,
  IUploadFiles,
} from '@/common/interfaces/chat.interface';
import { CHAT_COLLECTION, USER_CHAT_COLLECTION } from './chats.constant';
import { S3FileService } from '@/services';
import { AttachmentType } from '@/common/enums/attachment.enum';
import { UserRole } from '@/common/enums/user.enum';
import { ThaiBulkSmsService } from '@/services/thaibulksms.service';

@Injectable()
export class ChatsService {
  private readonly logger = new Logger(ChatsService.name);

  constructor(
    private readonly firebaseRepository: FirebaseRepository,
    private readonly usersService: UsersService,
    private readonly carsService: CarsService,
    private readonly s3FileService: S3FileService,
    private readonly thaiBulkSmsService: ThaiBulkSmsService,
  ) {}

  async create(createChatDto: ICreateChat) {
    const { message, chatId, userId, images, carId } = createChatDto;
    const currentUser = await this.usersService.findOne(userId);
    try {
      const firestore = this.firebaseRepository.getFirestore();
      await this.sendMessage(firestore, {
        message,
        chatId,
        senderId: currentUser.uid,
        images,
        carId,
      });
      return { message: 'success' };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async createRoom(
    createChatRoomDto: CreateChatRoomDto,
    currentUserId: number,
  ) {
    const { message, carId, interlocutorId } = createChatRoomDto;
    const currentUser = await this.usersService.findOne(currentUserId);
    const interlocutor = await this.usersService.findOne(interlocutorId);
    const car = await this.carsService.findOne(carId);
    try {
      const chatId = `U${currentUser.uid}-I${interlocutor.uid}-C${carId}`;
      const firestore = this.firebaseRepository.getFirestore();
      const chatRoom = await firestore
        .collection(CHAT_COLLECTION)
        .doc(chatId)
        .get();

      if (chatRoom.exists) {
        await this.sendMessage(firestore, {
          chatId,
          message,
          senderId: currentUser.uid,
        });
      } else if (message) {
        await this.initialChatRoom(firestore, {
          sender: currentUser,
          interlocutor,
          car,
          chatId,
          message,
        });

        try {
          await this.thaiBulkSmsService.notifyCarOwner(
            interlocutor.phoneNumber,
            carId,
          );
        } catch (error) {
          this.logger.error('Chat service: ThaiBulkSMS service error', error);
        }
      }

      return { chatId };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async updateCar(car: IChatCar): Promise<void> {
    try {
      const firestore = this.firebaseRepository.getFirestore();
      const chatSnapshot = await firestore
        .collection(CHAT_COLLECTION)
        .where('car.uid', '==', car.uid)
        .get();
      if (!chatSnapshot.empty) {
        await this.updateDocs(chatSnapshot.docs, { car });
      }
      const userChatSnapshot = await firestore
        .collectionGroup('interlocutors')
        .where('car.uid', '==', car.uid)
        .get();
      if (!userChatSnapshot.empty) {
        await this.updateDocs(userChatSnapshot.docs, { car });
      }
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async updateUser(interlocutor: IChatUser): Promise<void> {
    try {
      const firestore = this.firebaseRepository.getFirestore();
      const chatSnapshot = await firestore
        .collection('chats')
        .where(`members.${interlocutor.id}.id`, '==', interlocutor.id)
        .get();
      if (!chatSnapshot.empty) {
        await this.updateDocs(chatSnapshot.docs, {
          [`members.${interlocutor.id}`]: interlocutor,
        });
      }
      const userChatSnapshot = await firestore
        .collectionGroup('interlocutors')
        .where('interlocutor.id', '==', interlocutor.id)
        .get();
      if (!userChatSnapshot.empty) {
        await this.updateDocs(userChatSnapshot.docs, { interlocutor });
      }
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async getChatRooms(currentUserId: number, carId: number) {
    try {
      const currentUser = await this.usersService.findOne(currentUserId);
      const firestore = this.firebaseRepository.getFirestore();
      const userChatSnapshot = await firestore
        .collection(USER_CHAT_COLLECTION)
        .doc(currentUser.uid)
        .collection('interlocutors')
        .where('car.id', '==', carId)
        .get();

      const chatRooms = [];
      userChatSnapshot.forEach((doc) => {
        chatRooms.push(doc.data());
      });

      return chatRooms[0]?.chatId ?? null;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  private async updateDocs(
    docs: FirebaseFirestore.QueryDocumentSnapshot<
      FirebaseFirestore.DocumentData,
      FirebaseFirestore.DocumentData
    >[],
    data: any,
  ): Promise<void> {
    const maxDoc = 250;
    const works = [];
    while (docs.length > 0) {
      const samplingDocs = docs.splice(0, maxDoc);
      works.push(this.updateBatch(samplingDocs, data));
    }
    await Promise.all(works);
  }

  private async updateBatch(
    docs: FirebaseFirestore.QueryDocumentSnapshot<
      FirebaseFirestore.DocumentData,
      FirebaseFirestore.DocumentData
    >[],
    data: any,
  ): Promise<void> {
    try {
      const firestore = this.firebaseRepository.getFirestore();
      const batch = firestore.batch();
      docs.forEach((doc) => {
        batch.update(doc.ref, data);
      });
      await batch.commit();
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  private async sendMessage(
    firestore: FirebaseFirestore.Firestore,
    input: ISendChat,
  ) {
    const { chatId, message, senderId, images, carId } = input;
    const payloads: IChatPayload[] = [];
    const sentAt = new Date();

    if (message)
      payloads.push({
        content: message,
        sentAt,
        sentBy: senderId,
        type: 'text',
      });

    if (images) {
      const uploadedFiles = await this.uploadFiles({
        files: images,
        chatId,
        subDir: 'images',
      });

      for (const uploadedFile of uploadedFiles) {
        payloads.push({
          content: uploadedFile.location,
          sentAt,
          sentBy: senderId,
          type: 'image',
        });
      }
    }

    await firestore.runTransaction(async (t) => {
      const chatRoomDoc = await firestore
        .collection(CHAT_COLLECTION)
        .doc(chatId)
        .get();

      if (!chatRoomDoc.exists)
        throw new NotFoundException(`Chat room id#${chatId} is not found.`);

      for (const payload of payloads) {
        const messageDoc = firestore
          .collection(CHAT_COLLECTION)
          .doc(chatId)
          .collection('messages')
          .doc();
        t.set(messageDoc, payload);
      }

      const members: {
        id: string;
        name: string;
        PhoneNumber: string;
        profileImage: string;
      }[] = Object.values(chatRoomDoc.data()?.members ?? []);

      let receiverId: string;
      for (const member of members) {
        if (member.id !== senderId) {
          const interlocutorChatRef = firestore
            .collection(USER_CHAT_COLLECTION)
            .doc(member.id)
            .collection('interlocutors')
            .doc(`${senderId}-C${carId}`);

          t.update(interlocutorChatRef, { isRead: false, updatedAt: sentAt });
          receiverId = member.id;
        }
      }

      const senderChatRef = firestore
        .collection(USER_CHAT_COLLECTION)
        .doc(senderId)
        .collection('interlocutors')
        .doc(`${receiverId}-C${carId}`);
      t.update(senderChatRef, { updatedAt: sentAt });
    });
  }

  private async initialChatRoom(
    firestore: FirebaseFirestore.Firestore,
    input: ICreateChatRoom,
  ) {
    const { message, chatId, car, sender, interlocutor } = input;
    const chatCollection = firestore.collection(CHAT_COLLECTION);
    const userChatCollection = firestore.collection(USER_CHAT_COLLECTION);
    await firestore.runTransaction(async (t) => {
      const carData: IChatCar = {
        manufacturedYear: car.manufacturedYear,
        brandName: car.brandName,
        modelName: car.modelName,
        subModelName: car.subModelName,
        price: car.totalPrice,
        monthlyInstallment: car.monthlyInstallment,
        image:
          car.attachments?.find(
            (attachment) =>
              attachment.attachmentType === AttachmentType.EXTERIOR,
          )?.url ?? '-',
        uid: car.uid,
      };

      const userData: IChatUser = {
        id: sender.uid,
        name:
          sender.role === UserRole.DEALER
            ? sender.dealerName
            : `${sender.firstName} ${sender.lastName}`,
        profileImage: sender.profileImageUrl,
        phoneNumber: sender.phoneNumber ?? '-',
      };

      const interlocutorData = {
        id: interlocutor.uid,
        name:
          interlocutor.role === UserRole.DEALER
            ? interlocutor.dealerName
            : `${interlocutor.firstName} ${interlocutor.lastName}`,
        profileImage: interlocutor.profileImageUrl,
        phoneNumber: interlocutor.phoneNumber ?? '-',
      };

      const docRef = chatCollection.doc(chatId);
      t.set(docRef, {
        car: carData,
        members: {
          [userData.id]: userData,
          [interlocutorData.id]: interlocutorData,
        },
      });
      const messageDocRef = docRef.collection('messages').doc();

      t.set(messageDocRef, {
        content: message,
        sentAt: new Date(),
        sentBy: sender.uid,
        type: 'text',
      });

      const userChatInput = {
        car: { ...carData, id: car.id },
        chatId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const currentUserChatRef = userChatCollection
        .doc(sender.uid)
        .collection('interlocutors')
        .doc(`${interlocutor.uid}-C${car.id}`);

      t.set(currentUserChatRef, {
        ...userChatInput,
        interlocutor: interlocutorData,
        type: 'seller',
        isRead: true,
      });

      const interlocutorChatRef = userChatCollection
        .doc(interlocutor.uid)
        .collection('interlocutors')
        .doc(`${sender.uid}-C${car.id}`);

      t.set(interlocutorChatRef, {
        ...userChatInput,
        interlocutor: userData,
        type: 'buyer',
        isRead: false,
      });
    });
  }

  private async uploadFiles(input: IUploadFiles) {
    const { files, chatId, subDir } = input;
    const promises = [];
    for (const file of files) {
      promises.push(
        this.s3FileService.fileUpload(file, `chats/${chatId}/${subDir}`),
      );
    }
    return await Promise.all(promises);
  }
}
