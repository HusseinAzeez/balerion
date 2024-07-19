import { Car } from '@/db/entities/car.entity';
import { User } from '@/db/entities/user.entity';

export interface ICreateChatBase {
  chatId: string;
  message?: string | undefined;
  images?: Express.Multer.File[];
}

export interface ICreateChat extends ICreateChatBase {
  userId: number;
  carId?: string;
}

export interface ISendChat extends ICreateChatBase {
  senderId: string;
  carId?: string;
}

export interface ICreateChatRoom {
  message: string;
  chatId: string;
  car: Car;
  sender: User;
  interlocutor: User;
}

export interface IChatPayload {
  content: string;
  sentAt: Date;
  sentBy: string;
  type: string;
}

export interface IUploadFiles {
  files: Express.Multer.File[];
  chatId: string;
  subDir: string;
}

export interface IChatUser {
  id: string;
  name: string;
  profileImage: string;
  phoneNumber: string;
}

export interface IChatCar {
  manufacturedYear: number;
  monthlyInstallment: number;
  brandName: string;
  modelName: string;
  subModelName: string;
  price: number;
  image: string;
  uid: string;
}
