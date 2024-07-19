import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Stripe from 'stripe';

import { StripeService } from '@/services';
import { PaymentItemType } from '@/common/enums/payment.enum';
import { ProductPrice } from '@/db/entities/product-price.entity';
import { ServicePrice } from '@/db/entities/service-price.entity';
import { User } from '@/db/entities/user.entity';

import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ProductPriceType } from '@/common/enums/product-price.enum';
import { ServicePriceType } from '@/common/enums/service-price.enum';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly stripeService: StripeService,
    private readonly notificationsService: NotificationsService,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(ProductPrice)
    private readonly productPriceRepository: Repository<ProductPrice>,

    @InjectRepository(ServicePrice)
    private readonly servicePriceRepository: Repository<ServicePrice>,
  ) {}

  async create(dto: CreatePaymentDto, currentUserId: number) {
    const user = await this.userRepository.findOne({
      where: { id: currentUserId },
    });

    if (!user) {
      throw new NotFoundException(`User ${currentUserId} not found`);
    }

    const { paymentMethodId, paymentMethodType, rememberCard, paymentItems } =
      dto;

    const paymentItemsList = [];
    let amount = 0;
    for (const paymentItem of paymentItems) {
      if (paymentItem.paymentItemType === PaymentItemType.PRODUCT) {
        const productPrice = await this.productPriceRepository.findOne({
          where: { id: paymentItem.id },
        });

        if (!productPrice) {
          throw new NotFoundException(`Product ${paymentItem.id} not found`);
        }

        amount += productPrice.price * paymentItem.quantity * 100;
        paymentItemsList.push({
          ...paymentItem,
          name: productPrice.productType,
          priceQuantity: productPrice.quantity,
          price: productPrice.price,
          pricePerUnit: productPrice.pricePerUnit,
        });
      } else {
        const servicePrice = await this.servicePriceRepository.findOne({
          where: { id: paymentItem.id },
        });

        if (!servicePrice) {
          throw new NotFoundException(`Service ${paymentItem.id} not found`);
        }

        amount += servicePrice.price * paymentItem.quantity * 100;
        paymentItemsList.push({
          ...paymentItem,
          name: servicePrice.serviceType,
          priceQuantity: servicePrice.quantity,
          price: servicePrice.price,
          pricePerUnit: servicePrice.pricePerUnit,
        });
      }
    }

    const metadata = {
      paymentItems: JSON.stringify(paymentItemsList),
    };

    return await this.stripeService.createPaymentIntent(
      amount,
      paymentMethodId,
      paymentMethodType,
      user.stripeId,
      rememberCard,
      metadata,
    );
  }

  async findOne(id: string, currentUserId: number) {
    const user = await this.userRepository.findOne({
      where: { id: currentUserId },
    });

    if (!user) {
      throw new NotFoundException(`User ${currentUserId} not found`);
    }

    return await this.stripeService.retrievePaymentIntent(id);
  }

  async createPaymentMethod(
    dto: CreatePaymentMethodDto,
    currentUserId: number,
  ) {
    const user = await this.userRepository.findOne({
      where: { id: currentUserId },
    });

    if (!user) {
      throw new NotFoundException(`User ${currentUserId} not found`);
    }

    return await this.stripeService.createSetupIntent(
      dto.paymentMethodId,
      user.stripeId,
    );
  }

  async paymentMethods(currentUserId: number) {
    const user = await this.userRepository.findOne({
      where: { id: currentUserId },
    });

    if (!user) {
      throw new NotFoundException(`User ${currentUserId} not found`);
    }

    return await this.stripeService.listPaymentMethods(user.stripeId);
  }

  async removePaymentMethod(id: string) {
    return await this.stripeService.detachPaymentMethod(id);
  }

  async handleWebhook(event: Stripe.Event) {
    const { type, data } = event;

    switch (type) {
      case 'payment_intent.succeeded':
        this.logger.log(`Stripe Webhook: handling event type ${type}`);
        const paymentIntent = data.object;
        this.handlePaymentIntentSucceeded(
          paymentIntent as Stripe.PaymentIntent,
        );
        break;
      default:
        this.logger.log(`Stripe Webhook: unhandled event type ${type}`);
    }
  }

  private async handlePaymentIntentSucceeded(
    paymentIntent: Stripe.PaymentIntent,
  ) {
    const user = await this.userRepository.findOne({
      where: { stripeId: paymentIntent.customer as string },
    });

    if (!user) {
      this.logger.error(
        `Stripe Webhook: user not found ${paymentIntent.customer}`,
      );
    }

    const notificationTasks = [];

    const paymentItems = JSON.parse(paymentIntent.metadata['paymentItems']);

    for (const paymentItem of paymentItems) {
      if (paymentItem['paymentItemType'] === PaymentItemType.PRODUCT) {
        const productPrice = await this.productPriceRepository.findOne({
          where: { id: paymentItem['id'] },
        });
        if (productPrice.productType == ProductPriceType.BUMP) {
          user.bumpBalance += productPrice.quantity * paymentItem['quantity'];
        }
        if (productPrice.productType == ProductPriceType.CARSMEUP_CERTIFIED) {
          user.carsmeupCertifiedBalance +=
            productPrice.quantity * paymentItem['quantity'];
        }
        if (productPrice.productType == ProductPriceType.HOT_DEAL) {
          user.hotDealBalance +=
            productPrice.quantity * paymentItem['quantity'];
        }
        notificationTasks.push(
          this.notificationsService.createProductNotification({
            userId: user.id,
            productType: productPrice.productType,
          }),
        );
      } else {
        const servicePrice = await this.servicePriceRepository.findOne({
          where: { id: paymentItem['id'] },
        });
        if (servicePrice.serviceType == ServicePriceType.B_QUIK_BENZINE) {
          user.bquikBenzineBalance +=
            servicePrice.quantity * paymentItem['quantity'];
        }
        if (servicePrice.serviceType == ServicePriceType.B_QUIK_DIESEL) {
          user.bquikDieselBalance +=
            servicePrice.quantity * paymentItem['quantity'];
        }
        if (servicePrice.serviceType == ServicePriceType.ROADSIDE_ASSIST) {
          user.roadsideAssistBalance +=
            servicePrice.quantity * paymentItem['quantity'];
        }
        notificationTasks.push(
          this.notificationsService.createServiceNotification({
            userId: user.id,
            serviceType: servicePrice.serviceType,
          }),
        );
      }
    }
    await this.userRepository.save(user);

    await Promise.all(notificationTasks);
  }
}
