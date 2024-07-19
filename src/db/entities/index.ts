import { CarBodyType } from './car-body-type.entity';
import { CarBrand } from './car-brand.entity';
import { CarEngine } from './car-engine.entity';
import { CarEquipment } from './car-equipment.entity';
import { CarFuelType } from './car-fuel-type.entity';
import { CarLifestyle } from './car-lifestyle.entity';
import { CarYear } from './car-year.entity';
import { CarModel } from './car-model.entity';
import { CarSubModel } from './car-sub-model.entity';
import { CarTransmission } from './car-transmission.entity';
import { Car } from './car.entity';
import { Report } from './report.entity';
import { User } from './user.entity';
import { Attachment } from './attachment.entity';
import { ProductPrice } from './product-price.entity';
import { Staff } from './staff.entity';
import { MonthlyInstallment } from './monthly-installment.entity';
import { ServicePrice } from './service-price.entity';
import { Contact } from './contact.entity';
import { CarMarketprice } from './car-marketprice.entity';
import { UserRejectionLog } from './user-rejection-log.entity';
import { Banner } from './banner.entity';
import { CmuCertifiedRequest } from './cmu-certified-request.entity';
import { Voucher } from './voucher.entity';
import { SaveCar } from './save-car.entity';
import { VoucherDetail } from './voucher-detail.entity';
import { AnalyticsView } from './analytics-view.entity';
import { AnalyticsClick } from './analytics-click.entity';
import { AnalyticsImpression } from './analytics-impression.entity';
import { AuthenticationProvider } from './authentication-provider.entity';
import { BoltInsurance } from './bolt-insurance.entity';

const entities = [
  User,
  Report,
  Car,
  CarBrand,
  CarModel,
  CarSubModel,
  CarYear,
  CarTransmission,
  CarBodyType,
  CarFuelType,
  CarLifestyle,
  CarEngine,
  CarEquipment,
  CarMarketprice,
  Attachment,
  ProductPrice,
  Staff,
  MonthlyInstallment,
  Contact,
  ServicePrice,
  UserRejectionLog,
  Banner,
  CmuCertifiedRequest,
  Voucher,
  SaveCar,
  VoucherDetail,
  AnalyticsView,
  AnalyticsClick,
  AnalyticsImpression,
  AuthenticationProvider,
  BoltInsurance,
];
export default entities;
