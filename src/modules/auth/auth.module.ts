import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '@/db/entities/user.entity';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AtStrategy, RtStrategy } from './strategies';
import { Staff } from '@/db/entities/staff.entity';
import { EmailModule } from '../email/email.module';
import { FacebookStrategy } from './strategies/facebook.strategy';
import { PassportModule } from '@nestjs/passport';
import { HttpModule } from '@nestjs/axios';
import { GoogleStrategy } from './strategies/google.strategy';
import { ThaiBulkSmsService } from '@/services/thaibulksms.service';

@Module({
  imports: [
    JwtModule.register({}),
    TypeOrmModule.forFeature([User, Staff]),
    EmailModule,
    HttpModule,
    PassportModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AtStrategy,
    RtStrategy,
    FacebookStrategy,
    GoogleStrategy,
    ThaiBulkSmsService,
  ],
  exports: [AuthService],
})
export class AuthModule {}
