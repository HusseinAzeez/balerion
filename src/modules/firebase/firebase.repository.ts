import { Inject, Injectable } from '@nestjs/common';
import { app } from 'firebase-admin';

@Injectable()
export class FirebaseRepository {
  firestore: FirebaseFirestore.Firestore;

  constructor(@Inject('FIREBASE_APP') firebaseApp: app.App) {
    this.firestore = firebaseApp.firestore();
  }

  getFirestore() {
    return this.firestore;
  }
}
