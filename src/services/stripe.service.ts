import { PaymentMethodType } from '@/common/enums/payment.enum';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { isEmpty } from 'lodash';
import Stripe from 'stripe';

export type PaymentMethod = {
  id: string;
  createdAt: number;
  card: {
    brand: string;
    expMonth: number;
    expYear: number;
    last4: string;
    checkCvs: string;
  };
};

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(private configService: ConfigService) {
    this.stripe = new Stripe(this.configService.get('stripe.secretKey'), {
      apiVersion: this.configService.get('stripe.apiVersion'),
    });
  }

  // Customers API
  // POST /v1/customers
  // https://docs.stripe.com/api/customers/create
  async createCustomer(
    name: string,
    email: string,
    metadata: Record<string, string>,
  ): Promise<string> {
    try {
      const customer = await this.stripe.customers.create({
        name,
        email,
        metadata: metadata,
      });

      return customer.id;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // Payment Intents
  // POST /v1/payment_intents
  // https://docs.stripe.com/api/payment_intents/create
  async createPaymentIntent(
    amount: number,
    paymentMethodId: string,
    paymentMethodType: PaymentMethodType,
    customerId: string,
    rememberCard = false,
    metadata: Record<string, string>,
  ): Promise<Record<string, string>> {
    try {
      const options: Stripe.PaymentIntentCreateParams = {
        amount: amount,
        customer: customerId,
        currency: this.configService.get('stripe.currency'),
        payment_method_types: [paymentMethodType],
        metadata: metadata,
      };

      if (paymentMethodId) {
        options.payment_method = paymentMethodId;
      }

      if (rememberCard) {
        options.setup_future_usage = 'off_session';
      }

      const paymentIntent = await this.stripe.paymentIntents.create(options);

      return { clientSecret: paymentIntent.client_secret };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // Payment Intents
  // GET /v1/payment_intents/:id
  // https://docs.stripe.com/api/payment_intents/retrieve
  async retrievePaymentIntent(
    paymentIntentId: string,
  ): Promise<Stripe.PaymentIntent> {
    try {
      return await this.stripe.paymentIntents.retrieve(paymentIntentId);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // Setup Intents
  // POST /v1/setup_intents
  // https://docs.stripe.com/api/setup_intents/create
  async createSetupIntent(
    paymentMethodId: string,
    customerId: string,
  ): Promise<void> {
    try {
      await this.stripe.setupIntents.create({
        customer: customerId,
        payment_method: paymentMethodId,
        confirm: true,
        usage: 'off_session',
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // Payment Methods
  // POST /v1/payment_methods/:id/detach
  // https://docs.stripe.com/api/payment_methods/detach
  async detachPaymentMethod(paymentMethodId: string): Promise<void> {
    try {
      await this.stripe.paymentMethods.detach(paymentMethodId);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // Payment Methods
  // GET /v1/customers/:id/payment_methods
  // https://docs.stripe.com/api/payment_methods/customer_list
  async listPaymentMethods(customerId: string): Promise<[] | PaymentMethod[]> {
    try {
      const paymentMethods: Stripe.ApiList<Stripe.PaymentMethod> =
        await this.stripe.paymentMethods.list({
          customer: customerId,
        });

      if (isEmpty(paymentMethods)) {
        return [];
      }

      return paymentMethods.data.map((paymentMethod) => ({
        id: paymentMethod.id,
        createdAt: paymentMethod.created,
        card: {
          name: paymentMethod.billing_details?.name,
          brand: paymentMethod.card.brand,
          expMonth: paymentMethod.card.exp_month,
          expYear: paymentMethod.card.exp_year,
          last4: paymentMethod.card.last4,
          checkCvs: paymentMethod.card.checks.cvc_check,
        },
      }));
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  verifyWebhook(body: Buffer, signature: string) {
    return this.stripe.webhooks.constructEvent(
      body,
      signature,
      this.configService.get('stripe.webhookSecretKey'),
    );
  }
}
