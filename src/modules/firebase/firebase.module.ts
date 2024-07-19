import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import { FirebaseRepository } from './firebase.repository';

const firebaseProvider = {
  provide: 'FIREBASE_APP',
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    const firebaseConfig = {
      type: configService.get<string>('firebaseAdmin.type'),
      project_id: configService.get<string>('firebaseAdmin.projectId'),
      private_key_id: configService.get<string>('firebaseAdmin.privateKeyId'),
      private_key: configService
        .get<string>('firebaseAdmin.privateKey')
        ?.replace(/\\n/g, '\n'),
      client_email: configService.get<string>('firebaseAdmin.clientEmail'),
      client_id: configService.get<string>('firebaseAdmin.clientId'),
      auth_uri: configService.get<string>('firebaseAdmin.authUri'),
      token_uri: configService.get<string>('firebaseAdmin.tokenUri'),
      auth_provider_x509_cert_url: configService.get<string>(
        'firebaseAdmin.authProviderCertUrl',
      ),
      client_x509_cert_url: configService.get<string>(
        'firebaseAdmin.clientCertUrl',
      ),
      universe_domain: configService.get<string>(
        'firebaseAdmin.universeDomain',
      ),
    } as admin.ServiceAccount;

    return admin.initializeApp({
      credential: !Object.entries(firebaseConfig).some(([, value]) => !value)
        ? admin.credential.cert(firebaseConfig)
        : admin.credential.applicationDefault(),
    });
  },
};

@Module({
  imports: [ConfigModule],
  providers: [firebaseProvider, FirebaseRepository],
  exports: [FirebaseRepository],
})
export class FirebaseModule {}
