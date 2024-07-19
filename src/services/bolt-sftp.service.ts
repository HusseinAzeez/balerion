import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as openpgp from 'openpgp';
import * as Client from 'ssh2-sftp-client';
import * as fs from 'fs';
import { isEmpty, orderBy } from 'lodash';
import { parse } from 'csv-parse/sync';

const DAILY_DIRECTORY = '/carsmeup_transactions/daily';
const MONTHLY_DIRECTORY = '/carsmeup_transactions/monthly';

type Insurance = {
  bolttechId: string;
  insuranceType: string;
  insuranceCompany: string;
  productType: string;
  packageName: string;
  statusReason: string;
  insuredAt: Date;
  orderSoldDate: Date;
  policyNumber: string;
  policyStartDate: Date;
  policyEndDate: Date;
  totalAmount: number;
  netPremium: number;
  discountAmount: number;
  voucherCode: string;
  description: string;
  firstName: string;
  lastName: string;
  applicantEmail: string;
  applicantPhone: string;
  idType: string;
  idNumber: string;
  street1: string;
  street2: string;
  subDistrict: string;
  province: string;
  postCode: string;
  channel: string;
  salesMethod: string;
  sourceUTM: string;
  sourceMedium: string;
  sourceCampaign: string;
  partner: string;
  stampDuty: number;
  vat: number;
  birthday: string;
  paymentMethod: string;
  paymentTransactionId: string;
  customerConsent: string;
  externalCustomerId: string;
  paymentDate: Date;
  paymentType: string;
};

@Injectable()
export class BoltSFTPService {
  private readonly logger = new Logger(BoltSFTPService.name);
  private filename: string;
  private readonly sftpConfig = {
    host: this.configService.get<string>('bolt.sftp.host'),
    port: this.configService.get<number>('bolt.sftp.port'),
    username: this.configService.get<string>('bolt.sftp.username'),
    privateKey: '',
  };

  constructor(private readonly configService: ConfigService) {}

  async getInsuranceDataDaily(): Promise<Insurance[]> {
    const sftp = new Client();

    this.sftpConfig.privateKey = Buffer.from(
      this.configService.get<string>('bolt.sftp.privateKey'),
      'base64',
    ).toString('utf-8');

    const insuranceDataFromSFTP = await sftp
      .connect(this.sftpConfig)
      .then(async () => {
        let files = await sftp.list(DAILY_DIRECTORY);

        if (isEmpty(files)) {
          this.logger.log(
            'Bolt SFTP service (getInsuranceDataDaily): No files found',
          );
          return [];
        }

        files = orderBy(files, 'accessTime', 'desc');

        this.filename = files[0].name;

        const dst = fs.createWriteStream(`tmp/${this.filename}`);

        return await sftp.get(`${DAILY_DIRECTORY}/${this.filename}`, dst);
      })
      .then(async () => {
        const base64EncodedKey = this.configService.get<string>(
          'bolt.sftp.decryptKey',
        );

        const encryptedPrivateKey = await openpgp.readPrivateKey({
          armoredKey: Buffer.from(base64EncodedKey, 'base64').toString('utf-8'),
        });

        const decryptedPrivateKey = await openpgp.decryptKey({
          privateKey: encryptedPrivateKey,
          passphrase: this.configService.get<string>(
            'bolt.sftp.decryptKeyPassphrase',
          ),
        });

        const message = await openpgp.readMessage({
          armoredMessage: fs.readFileSync(`tmp/${this.filename}`, 'utf8'),
        });

        return await openpgp.decrypt({
          message: message,
          decryptionKeys: decryptedPrivateKey,
        });
      })
      .catch((error) => {
        this.logger.error('Bolt SFTP service (getInsuranceDataDaily):', error);
      })
      .finally(() => {
        sftp.end();

        if (this.filename) {
          fs.unlinkSync(`tmp/${this.filename}`);
          this.logger.log(
            `Bolt SFTP service (getInsuranceDataDaily): deleted file ${this.filename}`,
          );
        }

        this.logger.log(
          `Bolt SFTP service (getInsuranceDataDaily): done processing file ${this.filename}`,
        );
      });

    return this.parseInsuranceData(insuranceDataFromSFTP);
  }

  private parseInsuranceData(
    insuranceDataFromSFTP:
      | void
      | (openpgp.DecryptMessageResult & { data: string }),
  ): Insurance[] {
    const insurances: Insurance[] = [];

    if (insuranceDataFromSFTP) {
      const rows = parse(insuranceDataFromSFTP.data, {
        relax_column_count: true,
      });

      // Skip the header
      rows.shift();

      // NOTE: header data
      // -------------------------------------
      // 0 - Bolttech Id
      // 1 - Insurance Type
      // 2 - Insurance Company
      // 3 - Product Type
      // 4 - Package Name
      // 5 - Status Reason
      // 6 - Created On
      // 7 - Order Sold Date
      // 8 - Policy Number
      // 9 - Policy Start Date
      // 10 - Policy End Date
      // 11 - Total Amount
      // 12 - Net Premium
      // 13 - Discount Amount
      // 14 - Voucher Code
      // 15 - Description
      // 16 - First Name
      // 17 - Last Name
      // 18 - Applicant Email
      // 19 - Applicant Phone
      // 20 - Id Type
      // 21 - Id Number
      // 22 - Street 1
      // 23 - Street 2
      // 24 - Sub District
      // 25 - Province
      // 26 - Post Code
      // 27 - Channel
      // 28 - Sales Method
      // 29 - Source UTM
      // 30 - Source Medium
      // 31 - Source Campaign
      // 32 - Partner
      // 33 - Stamp Duty
      // 34 - VAT
      // 35 - Birthday
      // 36 - Payment Method
      // 37 - Payment Transaction Id
      // 38 - Customer Consent
      // 39 - External Customer Id
      // 40 - Payment Date
      // 41 - Payment Type
      for (const row of rows) {
        const insurance: Insurance = {
          bolttechId: row[0],
          insuranceType: row[1],
          insuranceCompany: row[2],
          productType: row[3],
          packageName: row[4],
          statusReason: row[5],
          insuredAt: this.parseDate(row[6]),
          orderSoldDate: this.parseDate(row[7]),
          policyNumber: row[8],
          policyStartDate: this.parseDate(row[9]),
          policyEndDate: this.parseDate(row[10]),
          totalAmount: row[11] === '' ? 0 : parseFloat(row[11]),
          netPremium: row[12] === '' ? 0 : parseFloat(row[12]),
          discountAmount: row[13] === '' ? 0 : parseFloat(row[13]),
          voucherCode: row[14],
          description: row[15],
          firstName: row[16],
          lastName: row[17],
          applicantEmail: row[18],
          applicantPhone: row[19],
          idType: row[20],
          idNumber: row[21],
          street1: row[22],
          street2: row[23],
          subDistrict: row[24],
          province: row[25],
          postCode: row[26],
          channel: row[27],
          salesMethod: row[28],
          sourceUTM: row[29],
          sourceMedium: row[30],
          sourceCampaign: row[31],
          partner: row[32],
          stampDuty: parseFloat(row[33]),
          vat: parseFloat(row[34]),
          birthday: row[35],
          paymentMethod: row[36],
          paymentTransactionId: row[37],
          customerConsent: row[38],
          externalCustomerId: row[39],
          paymentDate: this.parseDate(row[40]),
          paymentType: row[41],
        };
        insurances.push(insurance);
      }
    }
    return insurances;
  }

  private parseDate(date: string) {
    return date === '' ? null : new Date(date);
  }
}
