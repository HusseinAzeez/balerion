import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { BullModule } from '@nestjs/bull';
import Bull from 'bull';
import * as redisUrlParse from 'redis-url-parse';

import microserviceConfig from './config/microservice.config';
import configuration from '@/config/configuration';
import firebaseConfig from './config/firebase.config';

import { PaginationsModule } from '@/modules/paginations/paginations.module';
import { AtGuard } from '@/common/guards';
import { TransformInterceptor } from '@/common/interceptors/transform-response.interceptor';
import { AuthModule } from '@/modules/auth/auth.module';
import { UsersModule } from '@/modules/users/users.module';
import { ReportsModule } from './modules/reports/reports.module';
import { EmailModule } from '@/modules/email/email.module';
import { CarsModule } from '@/modules/cars/cars.module';
import { ProductPricesModule } from './modules/product-prices/product-prices.module';
import { StaffsModule } from '@/modules/staffs/staffs.module';
import { PaymentsModule } from '@/modules/payments/payments.module';
import entities from '@/db/entities';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ContactsModule } from './modules/contacts/contacts.module';
import { ServicePricesModule } from './modules/service-prices/service-prices.module';
import { BannersModule } from './modules/banners/banners.module';
import { CmuCertifiedRequestsModule } from './modules/cmu-certified-requests/cmu-certified-requests.module';
import { VouchersModule } from './modules/vouchers/vouchers.module';
import { FirebaseModule } from './modules/firebase/firebase.module';
import { ChatsModule } from './modules/chats/chats.module';
import { SaveCarsModule } from './modules/save-cars/save-cars.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { InsurancesModule } from './modules/insurances/insurances.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      ignoreEnvFile: process.env.MODE === 'production',
      load: [configuration, microserviceConfig, firebaseConfig],
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.name'),
        synchronize: false,
        namingStrategy: new SnakeNamingStrategy(),
        entities: entities,
        ssl: process.env.MODE === 'production',
        logging: process.env.MODE === 'development',
        migrations: ['dist/db/migrations/*{.ts,.js}'],

        // SeederOptions
        factories: ['dist/db/factories/*{.ts,.js}'],
        seeds: ['dist/db/seeds/*{.ts,.js}'],
      }),
      inject: [ConfigService],
    }),
    BullModule.forRootAsync({
      useFactory: (configService: ConfigService): Bull.QueueOptions => {
        const redisUrl = configService.get<string>('microservice.redisUrl');
        const parseUrl = redisUrlParse(redisUrl);
        return {
          redis: {
            host: parseUrl.host,
            port: +parseUrl.port,
            password: parseUrl.password,
            db: parseUrl.database,
          },
          prefix: 'be',
          defaultJobOptions: {
            attempts: 0,
            removeOnComplete: true,
            removeOnFail: false,
            backoff: 0,
          },
        };
      },
      imports: [ConfigModule],
      inject: [ConfigService],
    }),
    UsersModule,
    PaginationsModule,
    AuthModule,
    ReportsModule,
    EmailModule,
    CarsModule,
    ProductPricesModule,
    StaffsModule,
    ContactsModule,
    ServicePricesModule,
    BannersModule,
    PaymentsModule,
    CmuCertifiedRequestsModule,
    VouchersModule,
    FirebaseModule,
    ChatsModule,
    SaveCarsModule,
    AnalyticsModule,
    NotificationsModule,
    InsurancesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AtGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
})
export class AppModule {}
