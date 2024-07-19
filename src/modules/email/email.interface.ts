import { VoucherType } from '@/common/enums/voucher.enum';

export interface IUserVoucherPayload {
  email: string;
  voucherId: number;
  clientInformation: string;
  uid: string;
  isCMUVoucher: boolean;
}

export interface IProviderVoucherPayload {
  provider: string;
  carInformation: string;
  clientInformation: string;
  voucherType: VoucherType;
  activated: string;
  uid: string;
}

export interface IProviderVoucher {
  voucher: { uid: string; voucherType: VoucherType; activatedAt: Date };
  car: {
    brand: string;
    model: string;
    plateNumber: string;
    manufacturedYear?: number;
    subModel?: string;
  };
  client: {
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    email?: string;
  };
}

export interface IUserVoucher {
  uid: string;
  isCMUVoucher: boolean;
  voucherId: number;
  client: { email: string; firstName: string; lastName: string };
}

export interface ICmuCertifiedRequestsOnHold {
  car: {
    uid: string;
    brandName: string;
    modelName: string;
    subModelName: string;
    manufacturedYear: number;
  };
  email: string;
  reason: string;
}

export interface ICmuCertifiedRequestsApproval {
  car: {
    id: number;
    uid: string;
    manufacturedYear: number;
    brandName: string;
    modelName: string;
    subModelName: string;
    engineName: string;
  };
  email: string;
}

export interface ICmuCertifiedRequestsOnHoldPayload {
  email: string;
  reason: string;
  uid: string;
  carDetail: string;
}

export interface ICmuCertifiedRequestApprovalPayload {
  email: string;
  carId: number;
  uid: string;
  carDetail: string;
}
