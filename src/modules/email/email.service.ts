import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from '../auth/constants';
import {
  ICmuCertifiedRequestApprovalPayload,
  ICmuCertifiedRequestsOnHoldPayload,
  IProviderVoucherPayload,
  IUserVoucherPayload,
} from './email.interface';
import * as SendGrid from '@sendgrid/mail';
import { CreateContactDto } from '../contacts/dto/create-contact.dto';
import { humanize } from '@/common/helpers/enum.helper';
import { Car } from '@/db/entities/car.entity';
import * as moment from 'moment';
import { VoucherType } from '@/common/enums/voucher.enum';

@Injectable()
export class EmailService {
  sendGrid: SendGrid.MailService;

  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {
    this.sendGrid = SendGrid;
    this.sendGrid.setApiKey(configService.get('sendgrid.apiKey'));
  }

  private async sendEmail(data: any) {
    try {
      await this.sendGrid.send(data);
    } catch (error) {
      console.log(error);
    }
  }

  // User/Staff Email
  async sendForgotPassword(
    email: string,
    token: string,
    fullName: string,
    isSendToStaff: boolean,
  ) {
    let url = '';
    const jwtEncodeToken = await this.encodeJWTToken(email, token);
    if (isSendToStaff) {
      url = `${this.configService.get(
        'CMU_STAFF_URL',
      )}/login?resetPasswordToken=${jwtEncodeToken}`;
    } else {
      url = `${this.configService.get(
        'CMU_CLIENT_URL',
      )}?resetPasswordToken=${jwtEncodeToken}`;
    }

    const msg = {
      to: email,
      from: {
        email: this.getSenderEmail(),
        name: 'CarsmeUp',
      },
      templateId: this.configService.get('sendgrid.resetPasswordTemplateId'),
      dynamicTemplateData: {
        fullName: fullName,
        forgotPasswordLink: url,
      },
    };
    await this.sendEmail(msg);
  }

  async sendInviteUser(email: string, name: string, token: string) {
    const url = `${this.configService.get(
      'CMU_CLIENT_URL',
    )}?inviteToken=${token}`;
    const msg = {
      to: email,
      from: {
        email: this.getSenderEmail(),
        name: 'CarsmeUp',
      },
      templateId: this.configService.get('sendgrid.userInvitationTemplateId'),
      dynamicTemplateData: {
        name,
        inviteEmailLink: url,
      },
    };
    await this.sendEmail(msg);
  }

  // User Email
  async sendUserVerifyToken(email: string, token: string, fullName: string) {
    const url = `${this.configService.get(
      'CMU_CLIENT_URL',
    )}?verifiedToken=${token}`;
    const msg = {
      to: email,
      from: {
        email: this.getSenderEmail(),
        name: 'CarsmeUp',
      },
      templateId: this.configService.get(
        'sendgrid.verifyEmailAddressTemplateId',
      ),
      dynamicTemplateData: {
        fullName: fullName,
        verifyEmailLink: url,
      },
    };
    await this.sendEmail(msg);
  }

  // Staff Email
  async otpVerification(email: string, otp: string, otpRefNo: string) {
    const msg = {
      to: email,
      from: {
        email: this.getSenderEmail(),
        name: 'CarsmeUp',
      },
      templateId: this.configService.get('sendgrid.otpVerificationTemplateId'),
      dynamicTemplateData: {
        otp,
        otpRefNo,
      },
    };
    await this.sendEmail(msg);
  }

  async sendUserVoucher(data: IUserVoucherPayload) {
    const { voucherId, clientInformation, email, uid, isCMUVoucher } = data;
    const voucherLink = `${this.configService.get(
      'cmuClientUrl',
    )}profile-setting/products-and-services/${voucherId}`;
    const payload = {
      to: email,
      from: {
        email: this.getSenderEmail(),
        name: 'CarsmeUp',
      },
      templateId: this.configService.get('sendgrid.userVoucherTemplateId'),
      dynamicTemplateData: {
        clientInformation,
        voucherLink,
        uid,
        isCMUVoucher,
      },
    };
    await this.sendEmail(payload);
  }

  async sendProviderVoucher(data: IProviderVoucherPayload) {
    const {
      provider,
      voucherType,
      carInformation,
      clientInformation,
      activated,
      uid,
    } = data;

    const carsmeupAdminEmail = this.configService.get(
      `sendgrid.carsmeupAdminEmail`,
    );
    let providerEmail = '';

    switch (voucherType) {
      case VoucherType.B_QUIK_DIESEL:
      case VoucherType.B_QUIK_BENZINE: {
        providerEmail = this.configService.get('sendgrid.bQuikProviderEmail');
        break;
      }
      case VoucherType.ROADSIDE_ASSIST: {
        providerEmail = this.configService.get(
          'sendgrid.roadsideAssistProviderEmail',
        );
        break;
      }
      case VoucherType.CARSMEUP_CERTIFIED: {
        providerEmail = this.configService.get(
          'sendgrid.carsmeupCertifiedProviderEmail',
        );
        break;
      }
    }

    const payload = {
      to: [providerEmail, carsmeupAdminEmail],
      from: {
        email: this.getSenderEmail(),
        name: 'CarsmeUp',
      },
      templateId: this.configService.get('sendgrid.providerVoucherTemplateId'),
      dynamicTemplateData: {
        provider,
        voucherType,
        clientInformation,
        carInformation,
        activated,
        uid,
      },
    };
    await this.sendEmail(payload);
  }

  public async encodeJWTToken(email: string, token: string) {
    const enCodeToken = this.jwtService.sign(
      { token, email },
      {
        secret: jwtConstants.secret,
      },
    );
    return enCodeToken;
  }

  async sendOnHoldCmuCertifiedRequest(
    data: ICmuCertifiedRequestsOnHoldPayload,
  ) {
    const { email, carDetail, reason, uid } = data;
    const url = `${this.configService.get('CMU_CLIENT_URL')}`;
    const payload = {
      to: email,
      from: {
        email: this.getSenderEmail(),
        name: 'CarsmeUp',
      },
      templateId: this.configService.get(
        'sendgrid.onHoldCmuCertificationTemplateId',
      ),
      dynamicTemplateData: {
        carDetail,
        reason,
        uid,
        clientSiteLink: url,
      },
    };
    await this.sendEmail(payload);
  }

  async sendApprovalCmuCertifiedRequest(
    data: ICmuCertifiedRequestApprovalPayload,
  ) {
    const { email, carDetail, carId, uid } = data;
    const url = `${this.configService.get(
      'CMU_CLIENT_URL',
    )}my-car/${carId}/edit`;
    const payload = {
      to: email,
      from: {
        email: this.getSenderEmail(),
        name: 'CarsmeUp',
      },
      templateId: this.configService.get(
        'sendgrid.approvalCmuCertificationTemplateId',
      ),
      dynamicTemplateData: {
        carDetail,
        url,
        uid,
      },
    };
    await this.sendEmail(payload);
  }

  async sendContact(data: CreateContactDto) {
    const { email, topic, firstName, lastName, message } = data;
    const payload = {
      to: this.configService.get('sendgrid.contactFormReceiverEmail'),
      from: {
        email: this.getSenderEmail(),
        name: 'CarsmeUp',
      },
      templateId: this.configService.get('sendgrid.contactFormTemplateId'),
      dynamicTemplateData: {
        email,
        topic: humanize(topic),
        fullName: firstName.concat(' ', lastName),
        message,
      },
    };
    await this.sendEmail(payload);
  }

  async sendInviteStaff(email: string, token: string) {
    const url = `${this.configService.get(
      'CMU_STAFF_URL',
    )}/login?inviteToken=${token}`;
    const msg = {
      to: email,
      from: {
        email: this.getSenderEmail(),
        name: 'CarsmeUp',
      },
      templateId: this.configService.get('sendgrid.staffInvitationTemplateId'),
      dynamicTemplateData: {
        email,
        inviteEmailLink: url,
      },
    };
    await this.sendEmail(msg);
  }

  async sendApprovedDealerEmail(email: string, dealerName: string) {
    const url = `${this.configService.get('CMU_CLIENT_URL')}`;
    const msg = {
      to: email,
      from: {
        email: this.getSenderEmail(),
        name: 'CarsmeUp',
      },
      templateId: this.configService.get('sendgrid.dealerApprovedTemplateId'),
      dynamicTemplateData: {
        dealerName,
        clientSiteUrl: url,
      },
    };
    await this.sendEmail(msg);
  }

  async sendRejectedDealerEmail(email: string, dealerName: string) {
    const msg = {
      to: email,
      from: {
        email: this.getSenderEmail(),
        name: 'CarsmeUp',
      },
      templateId: this.configService.get('sendgrid.dealerRejectedTemplateId'),
      dynamicTemplateData: {
        dealerName,
      },
    };
    await this.sendEmail(msg);
  }

  async sendApplyForLoan(
    firstName: string,
    lastName: string,
    url: string,
    car: Car,
    phoneNumber: string,
  ) {
    let carPriceAfterDiscount = null;
    const carPrice = car.price;
    if (car.discount > 0) {
      carPriceAfterDiscount = car.price - car.discount;
    }
    const owner = `${car.user.firstName} ${car.user.lastName}`;
    const carInformation = `${car.registeredYear} ${car.brandName} ${car.modelName} ${car.subModelName}`;
    const loaner = `${firstName} ${lastName}, ${phoneNumber}`;
    const appliedDate = moment(new Date())
      .add(7, 'h')
      .format('D-MMM-YYYY HH:MM');
    const msg = {
      to: this.configService.get('sendgrid.applyForLoadProviderEmail'),
      from: {
        email: this.getSenderEmail(),
        name: 'CarsmeUp',
      },
      templateId: this.configService.get(
        'sendgrid.applyForLoanInformationTemplateId',
      ),
      dynamicTemplateData: {
        carInformation: carInformation,
        carOwner: owner,
        carPriceAfterDiscount,
        carPrice,
        loaner: loaner,
        applied: appliedDate,
        url,
      },
    };
    await this.sendEmail(msg);
  }

  private getSenderEmail() {
    return this.configService.get('sendgrid.senderEmail');
  }
}
