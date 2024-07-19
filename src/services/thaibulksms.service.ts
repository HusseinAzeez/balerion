import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as qs from 'qs';

type RequestOTPResponse = {
  status: string;
  token: string;
  refno: string;
};

type VerifyOTPResponse = {
  status: string;
  message: string;
};

@Injectable()
export class ThaiBulkSmsService {
  private readonly logger = new Logger(ThaiBulkSmsService.name);
  private apiKey: string;
  private apiSecret: string;
  private otpServiceApiKey: string;
  private otpServiceApiSecret: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.apiKey = this.configService.get('thaiBulkSMS.apiKey');
    this.apiSecret = this.configService.get('thaiBulkSMS.apiSecret');
    this.otpServiceApiKey = this.configService.get(
      'thaiBulkSMS.otpService.apiKey',
    );
    this.otpServiceApiSecret = this.configService.get(
      'thaiBulkSMS.otpService.apiSecret',
    );
  }

  async notifyCarOwner(phoneNumber: string, carId: number) {
    const message = `มีบางคนสนใจรถของคุณ \nSomeone is interested in your car.\n${this.configService.get(
      'cmuClientUrl',
    )}/th/used-cars/${carId}`;

    await this.sendSMS(phoneNumber, message);
  }

  // SMS API
  // https://api-v2.thaibulksms.com/sms
  // Manual: https://assets.thaibulksms.com/documents/developer-manual/nwc/API-v2-en.pdf
  async sendSMS(phoneNumber: string, message: string): Promise<void> {
    try {
      const body = qs.stringify({
        sender: this.configService.get('thaiBulkSMS.sender'),
        msisdn: phoneNumber,
        force: 'corporate', // User corporate account
        message: message,
      });

      await this.httpService.axiosRef.post<RequestOTPResponse>(
        'https://api-v2.thaibulksms.com/sms',
        body,
        {
          auth: {
            username: this.apiKey,
            password: this.apiSecret,
          },
        },
      );
    } catch (error) {
      this.logger.error(
        `ThaiBulkSMS service: Failed to send a SMS. Error ${error.response.data.error.description}`,
      );
      throw new BadRequestException(error.response.data.error.description);
    }
  }

  // OTP service API
  // POST https://otp.thaibulksms.com/v2/otp/request
  // https://developer.thaibulksms.com/reference/post_v2-otp-request
  async requestOTP(phoneNumber: string): Promise<RequestOTPResponse> {
    try {
      const body = qs.stringify({
        key: this.otpServiceApiKey,
        secret: this.otpServiceApiSecret,
        msisdn: phoneNumber,
      });

      const response = await this.httpService.axiosRef.post<RequestOTPResponse>(
        'https://otp.thaibulksms.com/v2/otp/request',
        body,
      );

      return response.data;
    } catch (error) {
      const errorMessage = this.getErrorMessage(error);
      this.logger.error(
        `ThaiBulkSMS service: Failed to request an OTP. Error ${errorMessage}`,
      );
      throw new BadRequestException(errorMessage);
    }
  }

  // OTP service API
  // POST https://otp.thaibulksms.com/v2/otp/verify
  // https://developer.thaibulksms.com/reference/post_v2-otp-verify
  async verifyOTP(otp: string, token: string): Promise<VerifyOTPResponse> {
    try {
      const body = qs.stringify({
        key: this.otpServiceApiKey,
        secret: this.otpServiceApiSecret,
        token: token,
        pin: otp,
      });

      const response = await this.httpService.axiosRef.post<VerifyOTPResponse>(
        'https://otp.thaibulksms.com/v2/otp/verify',
        body,
      );

      return response.data;
    } catch (error) {
      const errorMessage = this.getErrorMessage(error);
      this.logger.error(
        `ThaiBulkSMS service: Failed to verify an OTP. Error ${errorMessage}`,
      );
      throw new BadRequestException(errorMessage);
    }
  }

  private getErrorMessage(error: any) {
    return error.response.data?.errors[0]?.message;
  }
}
