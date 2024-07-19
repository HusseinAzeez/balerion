import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as qs from 'qs';
import { isEmpty } from 'lodash';

import { CarColor } from '@/common/enums/car.enum';
import * as provinces from '@/db/seeds/data/provinces.json';
import * as districts from '@/db/seeds/data/districts.json';
import { humanize } from '@/common/helpers/enum.helper';

type Car4sureItemList = {
  Car_reference_id: string;
  Car_post_type_id: string;
  Title: string;
  Car_image: string[];
  Manufacture_year: string;
  Car_type: string;
  Car_subtype: string;
  Brand: string;
  Model: string;
  Submodel: string;
  Series: string;
  Price: string;
  Discount_price: string;
  Fuel_type: string;
  Drive_type: string;
  Transmission: string;
  Engine_capacity: string;
  Mileage: string;
  Color: string;
  Registration: string;
  Province: string;
  Description: string;
  Condition: string;
  Car_certificated: string;
  Pdf_certificated: string;
  Dealer_code_ref: string;
  Dealer_name: string;
  Dealer_email: string;
  Dealer_logo: string;
  Dealer_image: string[];
  Dealer_full_name: string;
  Dealer_mobile_number: string;
  Dealer_line_id: string;
  Dealer_address_lat_long: string;
  Dealer_address: string;
  Dealer_province: string;
  Dealer_district: string;
  Seller_type: string;
  Partner_name: string;
  Post_status: string;
  Post_publish: number;
  Total_view_count: string;
  Created_date: string;
  Last_update_date: string;
};

type Car4surePostListResponse = {
  app_id: string;
  app_name: string;
  module_id: string;
  service_id: string;
  language_id: string;
  error_code: number;
  error_key: string;
  error_description: string;
  result_status: number; // 0 no data, 1 success
  page_total: string;
  page_current: number;
  page_item: number;
  item_total: string;
  item_list: Car4sureItemList[];
};

type Car4SureTokenResponse = {
  app_id: string;
  app_name: string;
  module_id: string;
  service_id: string;
  language_id: string;
  error_code: number;
  error_key: string;
  error_description: string;
  result_status: number;
  token: string;
  expire: string;
};

type Car4SureProcessedCar = {
  status: string;
  brandName: string;
  modelName: string;
  subModelName: string;
  manufacturedYear: number;
  bodyTypeName: string;
  fuelTypeName: string;
  transmissionName: string;
  engineName: string;
  price: number;
  discount: number;
  totalPrice: number;
  mileage: number;
  color: CarColor;
  plateNumber: string;
  province: string;
  district: string;
  imageUrls: string[];
  description: string;
};

type Car4SurePorccessedList = {
  firstName: string;
  lastName: string;
  email: string;
  dealerName: string;
  lineId: string;
  phoneNumber: string;
  profileImageUrl: string;
  province: string;
  district: string;
  zipcode: string;
  cars: Record<string, Car4SureProcessedCar>;
};

@Injectable()
export class Car4sureService {
  private readonly logger = new Logger(Car4sureService.name);
  private token: string;
  private tokenExpireAt: Date;
  private appId: string;
  private clientId: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.appId = this.configService.get<string>('car4sure.appId');
    this.clientId = this.configService.get<string>('car4sure.clientId');
  }

  // NOTE: workflow
  // =======================================================================================
  // 1. Get access token.
  // 2. Call the post index API to refresh the data returned by the Post list API.
  // 3. Call the post list API and process the post data.
  // 4. Call the post success API with the proccessed post IDs to mark them as successful.
  // 5. Call the post failer API with the a post ID to mark it as failer with a remark.
  // 6. Call the post index clear API to remove the successful posts from the post index API.

  // API: https://carsmeup.car4sure.com/api/car_post/index
  // Content-Type: application/x-www-form-urlencoded
  // Payload:
  // ==========================================================
  // Name       Type       Required     Default     Description
  // ==========================================================
  // app_id     string     true         null
  // status_id  number     false        null        1: Success | 2: Pending | 3: Fail | 4: Reject | null: All
  async postIndex(): Promise<void> {
    await this.refreshToken();

    const body = qs.stringify({
      app_id: this.appId,
    });

    try {
      await this.httpService.axiosRef.post(
        'https://carsmeup.car4sure.com/api/car_post/index',
        body,
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        },
      );
      this.logger.log(
        `Car4sure service (postIndex): post index has been returned`,
      );
    } catch (error) {
      this.logger.error(
        `Car4sure service (postIndex): Failed to post index API. ${error}`,
      );
    }
  }

  // API: https://carsmeup.car4sure.com/cronjob/car_post/index
  // Content-Type: application/x-www-form-urlencoded
  // Payload:
  // =========================================================
  // Name       Type       Required     Default
  // =========================================================
  // app_id:    string     true         null
  async postIndexClear(): Promise<void> {
    await this.refreshToken();

    const body = qs.stringify({
      app_id: this.appId,
    });

    try {
      await this.httpService.axiosRef.post(
        'https://carsmeup.car4sure.com/cronjob/car_post/index',
        body,
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        },
      );
      this.logger.log(
        `Car4sure service (postIndexClear): post index has been cleared`,
      );
    } catch (error) {
      this.logger.error(
        `Car4sure service (postIndexClear): Failed to post index clear API. ${error}`,
      );
    }
  }

  // API: https://carsmeup.car4sure.com/cronjob/car_post/index
  // Content-Type: application/x-www-form-urlencoded
  // Payload:
  // =========================================================
  // Name       Type       Required     Default
  // =========================================================
  // app_id:    string     true         null
  // page:      number     false        1
  // limit:     number     false        100
  async postList(page = 1, limit = 100): Promise<Car4surePostListResponse> {
    await this.refreshToken();

    const body = qs.stringify({
      app_id: this.appId,
      page: page,
      limit: limit,
    });

    try {
      const response =
        await this.httpService.axiosRef.post<Car4surePostListResponse>(
          'https://carsmeup.car4sure.com/api/car_post/lists',
          body,
          {
            headers: {
              Authorization: `Bearer ${this.token}`,
            },
          },
        );

      this.logger.log(
        `Car4sure service (postList): post list has been returned`,
      );
      return response.data;
    } catch (error) {
      this.logger.error(
        `Car4sure service (postList): Failed to post list API. ${error}`,
      );
    }
  }

  // API: https://carsmeup.car4sure.com/api/car_post/successful
  // Content-Type: application/x-www-form-urlencoded
  // Payload:
  // =========================================================
  // Name           Type        Required     Default
  // =========================================================
  // app_id:        string      true         null
  // car_post_ids:  string[]    true         null
  async postSuccessful(carPostIds: string[]): Promise<void> {
    await this.refreshToken();

    const body = qs.stringify({
      app_id: this.appId,
      car_post_ids: carPostIds,
    });

    try {
      await this.httpService.axiosRef.post<Car4surePostListResponse>(
        'https://carsmeup.car4sure.com/api/car_post/successful',
        body,
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        },
      );
      this.logger.log(
        `Car4sure service (postSuccessful): post has been marked as successful`,
      );
    } catch (error) {
      this.logger.error(
        `Car4sure service (postSuccessful): Failed to post successful API. ${error}`,
      );
    }
  }

  // API: https://carsmeup.car4sure.com/api/car_post/failure
  // Content-Type: application/x-www-form-urlencoded
  // Payload:
  // =========================================================
  // Name           Type        Required        Default
  // =========================================================
  // app_id         string      true            null
  // car_post_id    string      true            null
  // remark         string      false           null
  async postFailure(carPostId: string): Promise<void> {
    await this.refreshToken();

    const body = qs.stringify({
      app_id: this.appId,
      car_post_id: carPostId,
    });

    try {
      await this.httpService.axiosRef.post<Car4surePostListResponse>(
        'https://carsmeup.car4sure.com/api/car_post/failure',
        body,
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        },
      );
      this.logger.log(
        `Car4sure service (postFailure): post has been marked as failure`,
      );
    } catch (error) {
      this.logger.error(
        `Car4sure service (postFailure): Failed to post failure API. ${error}`,
      );
    }
  }

  // API: https://carsmeup.car4sure.com/api/authorize/token
  // Content-Type: application/x-www-form-urlencoded
  // Payload:
  // =========================================================
  // Name           Type        Required        Default
  // =========================================================
  // app_id         string      true            null
  // client_id      string      true            null
  async refreshToken() {
    const body = qs.stringify({
      app_id: this.appId,
      client_id: this.clientId,
    });

    if (!this.token || new Date() > this.tokenExpireAt) {
      try {
        const response =
          await this.httpService.axiosRef.post<Car4SureTokenResponse>(
            'https://carsmeup.car4sure.com/api/authorize/token',
            body,
          );

        this.token = response.data.token;
        this.tokenExpireAt = new Date(response.data.expire);
        this.logger.log(
          `Car4sure service (refreshToken): token has been refreshed`,
        );
      } catch (error) {
        this.logger.error(
          `Car4sure service (refreshToken): Failed to refresh token. ${error}`,
        );
      }
    }
  }

  async processPostList(): Promise<Record<string, Car4SurePorccessedList>> {
    await this.postIndex();

    // Get the first 100 posts
    let data = await this.postList();

    const dealers: Record<string, Car4SurePorccessedList> = {};

    if (isEmpty(data) || data.result_status === 0) {
      return dealers;
    }

    const pageLimit = this.configService.get('car4sure.pageLimit');
    const totalPages = parseInt(pageLimit);

    for (let currentPage = 1; currentPage <= totalPages; ++currentPage) {
      if (!isEmpty(data.item_list)) {
        for (const post of data.item_list) {
          if (!dealers[post.Dealer_code_ref]) {
            dealers[post.Dealer_code_ref] = {
              firstName: post.Dealer_full_name.split(' ')[0],
              lastName: post.Dealer_full_name.split(' ')[1],
              email: post.Dealer_email,
              dealerName: post.Dealer_name,
              phoneNumber: post.Dealer_mobile_number,
              lineId: post.Dealer_line_id,
              profileImageUrl: post.Dealer_logo,
              province: this.mapProvince(post.Dealer_province) ?? null,
              district: this.mapDistrict(post.Dealer_district) ?? null,
              zipcode: null,
              cars: {},
            };

            if (dealers[post.Dealer_code_ref].district) {
              dealers[post.Dealer_code_ref].zipcode =
                this.extractPostCodeFrom(post.Dealer_address) ?? null;
            }
          }

          if (!dealers[post.Dealer_code_ref].cars[post.Car_reference_id]) {
            const price = this.parseStrWithCommaInt(post.Price);
            // NOTE(Hussein): Car4sure's Discount_price is price - discount
            let totalPrice = this.parseStrWithCommaInt(post.Discount_price);
            let discount = price - totalPrice;

            if (totalPrice === 0) {
              totalPrice = price;
              discount = 0;
            }

            const modelName = this.mapModel(
              humanize(post.Model.trim().toLowerCase()),
            );
            const subModelName = this.mapSubModel(
              post.Submodel.trim(),
              modelName,
            );

            dealers[post.Dealer_code_ref].cars[post.Car_reference_id] = {
              status: this.mapPostStatus(post.Car_post_type_id),
              brandName: this.mapBrand(
                humanize(post.Brand.trim().toLowerCase()),
              ),
              modelName: modelName,
              subModelName: subModelName,
              manufacturedYear:
                this.parseStrWithCommaInt(post.Manufacture_year) ?? 2024,

              bodyTypeName: this.mapBodyType(post.Car_type),
              fuelTypeName: this.mapFuelType(post.Fuel_type),
              transmissionName: this.mapTransmission(post.Transmission),
              engineName: this.mapEngine(post.Engine_capacity),

              price: price,
              discount: discount,
              totalPrice: totalPrice,
              mileage: this.parseStrWithCommaInt(post.Mileage),

              color: this.mapColor(post.Color),
              plateNumber: post.Registration,

              province: this.mapProvince(post.Province) ?? '-',
              district: '-',

              imageUrls: post.Car_image,
              description: post.Description,
            };
          }
        }
      }

      data = await this.postList(currentPage);

      if (isEmpty(data) || data.result_status === 0) {
        return dealers;
      }

      this.logger.log(
        `Car4sure service (processPostList): proccessed ${100} cars`,
      );
    }
    return dealers;
  }

  // Converts '200,000' into 200000
  // Returns 0 if empty string passed.
  private parseStrWithCommaInt(str: string): number {
    if (!str) {
      return 0;
    }

    return parseInt(str.trim().replace(',', ''));
  }

  private mapEngine(engineName: string) {
    let engineNameClean = engineName.trim().replace(',', '');

    // NOTE(Hussein): some of Car4sure's cars have very large engine Engine_capacity
    if (engineNameClean.length >= 5) {
      engineNameClean = engineNameClean.substring(0, 4);
    }

    return engineNameClean;
  }

  private mapProvince(province: string): string {
    if (!province) {
      return null;
    }

    return provinces[province.trim()];
  }

  private mapDistrict(district: string): string {
    if (!district) {
      return null;
    }

    return districts[district.trim()];
  }

  private extractPostCodeFrom(address: string): string {
    const postcode = address.match('/\bd{5}\b/');

    // NOTE(Hussein): in case of an empty address,
    // default to Pathum Wan's postcode.
    if (!postcode) {
      return '10330';
    }

    return postcode[0];
  }

  private mapBrand(brandName: string): string {
    switch (brandName) {
      case 'Bmw': {
        return 'BMW';
      }
      case 'Benz': {
        return 'Mercedes-Benz';
      }
      case 'DEVA': {
        return 'Deva';
      }
      case 'FOMM': {
        return 'Fomm';
      }
      case 'LINCOLN': {
        return 'Lincoln';
      }
      case 'Mg': {
        return 'MG';
      }
      case 'Ora': {
        return 'ORA';
      }
      case 'TESLA': {
        return 'Tesla';
      }
      case 'Volkswaken': {
        return 'Volkswagen';
      }
      default: {
        return brandName;
      }
    }
  }

  private mapModel(modelName: string): string {
    switch (modelName) {
      case '200 sk': {
        return '200 SK';
      }
      case '3200 gt': {
        return '3200 GT';
      }
      case '350z': {
        return '350Z';
      }
      case '370z': {
        return '370Z';
      }
      case 'A-class': {
        return 'A-Class';
      }
      case 'ALPHARD': {
        return 'Alphard';
      }
      case 'AVANZA': {
        return 'Avanza';
      }
      case 'bB':
      case 'BB': {
        return 'Bb';
      }
      case 'B-class': {
        return 'B-Class';
      }
      case 'Br-v': {
        return 'BR-V';
      }
      case 'Bt-50': {
        return 'BT-50';
      }
      case 'C-class': {
        return 'C-Class';
      }
      case 'CITY': {
        return 'City';
      }
      case 'Cla-class': {
        return 'CLA-Class';
      }
      case 'Cls-class': {
        return 'CLS-Class';
      }
      case 'Clk-class': {
        return 'CLK-Class';
      }
      case 'COROLLA': {
        return 'Corolla';
      }
      case 'Corolla altis': {
        return 'Corolla Altis';
      }
      case 'Crv': {
        return 'CR-V';
      }
      case 'C-hr': {
        return 'C-HR';
      }
      case 'Hr-v': {
        return 'HR-V';
      }
      case 'Cx-30': {
        return 'CX-30';
      }
      case 'Cx-3': {
        return 'CX-3';
      }
      case 'Cx-5': {
        return 'CX-5';
      }
      case 'Cx-8': {
        return 'CX-8';
      }
      case 'E-class': {
        return 'E-Class';
      }
      case 'G-class': {
        return 'G-Class';
      }
      case 'Ecosport': {
        return 'EcoSport';
      }
      case 'Es': {
        return 'ES';
      }
      case 'ESTIMA': {
        return 'Estima';
      }
      case 'For-Four': {
        return 'Forfour';
      }
      case 'Frontier navara': {
        return 'Frontier Navara';
      }
      case 'Good cat': {
        return 'Good Cat';
      }
      case 'Grand carnival': {
        return 'Grand Carnival';
      }
      case 'Grand starex': {
        return 'Grand Starex';
      }
      case 'Gs': {
        return 'GS';
      }
      case 'Hs': {
        return 'HS';
      }
      case 'Gt-r': {
        return 'GT-R';
      }
      case 'HARRIER': {
        return 'Harrier';
      }
      case 'HIACE': {
        return 'Hiace';
      }
      case 'Hilux vigo': {
        return 'Hilux Vigo';
      }
      case 'LANCER': {
        return 'Lancer';
      }
      case 'Land cruiser': {
        return 'Land Cruiser';
      }
      case 'Mg3': {
        return 'MG3';
      }
      case 'Mg4': {
        return 'MG4';
      }
      case 'Mg5': {
        return 'MG5';
      }
      case 'Mg6': {
        return 'MG6';
      }
      case 'Ml-class': {
        return 'ML-Class';
      }
      case 'Mu-7': {
        return 'MU-7';
      }
      case 'Mu-x': {
        return 'MU-X';
      }
      case 'Mx5': {
        return 'MX-5';
      }
      case 'Range rover': {
        return 'Range Rover';
      }
      case 'S-class': {
        return 'S-Class';
      }
      case 'V-class': {
        return 'V-Class';
      }
      case 'Slk-class': {
        return 'SLK-Class';
      }
      case 'Slc-class': {
        return 'SLC-Class';
      }
      case 'Sport cruiser': {
        return 'Sport Cruiser';
      }
      case 'Strada g wagon': {
        return 'Strada G-Wagon';
      }
      case 'Sx4': {
        return 'SX4';
      }
      case 'Tt': {
        return 'TT';
      }
      case 'VELLFIRE': {
        return 'Vellfire';
      }
      case 'VIOS': {
        return 'Vios';
      }
      case 'Vs': {
        return 'VS';
      }
      case 'WISH': {
        return 'Wish';
      }
      case 'Xc40': {
        return 'XC40';
      }
      case 'Xc60': {
        return 'XC60';
      }
      case 'Xc90': {
        return 'XC90';
      }
      case 'Xf series': {
        return 'XF';
      }
      case 'Xl7': {
        return 'XL7';
      }
      case 'X-trail': {
        return 'X-Trail';
      }
      case 'Xv': {
        return 'XV';
      }
      case 'Yaris ativ': {
        return 'Yaris Ativ';
      }
      case 'Zs': {
        return 'ZS';
      }
      case 'Zx': {
        return 'ZX';
      }
      case 'SOLUNA': {
        return 'Soluna';
      }
      default: {
        return modelName;
      }
    }
  }

  private mapSubModel(subModelName: string, modelName: string): string {
    const regex = new RegExp('\\b' + modelName + '\\b', 'gi');
    return subModelName.replace(regex, '').trim();
  }

  // NOTE(Hussein): (1: Add | 2: Edit | 3: Change Status | 4: Delete | 5: Change Publish)
  private mapPostStatus(postStatus: string): string {
    switch (postStatus) {
      case '1': {
        return 'Add';
      }
      case '2':
      case '3':
      case '5': {
        return 'Edit';
      }
      case '4': {
        return 'Delete';
      }
      default: {
        return 'Edit';
      }
    }
  }

  private mapBodyType(bodyType: string): string {
    switch (bodyType) {
      case 'รถเก๋ง': {
        return 'Sedan';
      }
      case 'รถกระบะ': {
        return 'Pickup';
      }
      case 'รถตู้': {
        return 'Van';
      }
      case 'รถอเนกประสงค์': {
        return 'SUV';
      }
      default: {
        return 'Sedan';
      }
    }
  }

  private mapFuelType(fuelType: string): string {
    switch (fuelType) {
      case 'เบนซิน':
      case 'เบนซิน+LPG':
      case 'เบนซิน+CNG': {
        return 'Petrol';
      }
      case 'ดีเซล': {
        return 'Diesel';
      }
      case 'ไฟฟ้า/Hybrid': {
        return 'Hybrid';
      }
      case 'ไฟฟ้': {
        return 'Electric';
      }
      default: {
        return 'Petrol';
      }
    }
  }

  private mapTransmission(transmission: string): string {
    switch (transmission) {
      case 'AUTO':
      case 'AUTO 4WD': {
        return 'Automatic';
      }
      case 'MT': {
        return 'Manual';
      }
      default: {
        return 'Automatic';
      }
    }
  }

  private mapColor(color: string): CarColor {
    switch (color) {
      case 'เทา': {
        return CarColor.GREY;
      }
      case 'ขาว': {
        return CarColor.WHITE;
      }
      case 'ดำ': {
        return CarColor.BLACK;
      }
      case 'แดง': {
        return CarColor.RED;
      }
      case 'เหลือง': {
        return CarColor.BLUE;
      }
      case 'น้ำตาล': {
        return CarColor.BROWN;
      }
      case 'น้ำเงิน': {
        return CarColor.BLUE;
      }
      case 'ส้ม': {
        return CarColor.ORANGE;
      }
      case 'ฟ้า': {
        return CarColor.LIGHT_BLUE;
      }
      case 'ม่วง': {
        return CarColor.PURPLE;
      }
      case 'ชมพู': {
        return CarColor.PINK;
      }
      case 'เขียว': {
        return CarColor.GREEN;
      }
      default: {
        return CarColor.OTHERS;
      }
    }
  }
}
