import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  RawBodyRequest,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { GetCurrentUserId, Public } from '@/common/decorators';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import {
  ApiBearerAuth,
  ApiExcludeEndpoint,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  CreatePaymentResponseSchema,
  PaymentMethodResponseSchema,
} from './payments.constant';
import stripe from 'stripe';
import { StripeService } from '@/services';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private stripeService: StripeService,
  ) {}

  @Public()
  @Post('webhooks')
  @ApiExcludeEndpoint()
  async stripeWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Res() res: Response,
  ) {
    let event: stripe.Event;

    try {
      event = this.stripeService.verifyWebhook(
        req.rawBody,
        req.headers['stripe-signature'] as string,
      );
    } catch (err) {
      res.status(400).send(`Stripe Webhook: Error: ${err.message}`);
    }

    await this.paymentsService.handleWebhook(event);

    res.json({ received: true });
  }

  @Post('methods')
  @ApiBearerAuth()
  createPaymentMethod(
    @GetCurrentUserId() currentUserId: number,
    @Body() dto: CreatePaymentMethodDto,
  ) {
    return this.paymentsService.createPaymentMethod(dto, currentUserId);
  }

  @Get('methods')
  @ApiBearerAuth()
  @ApiOkResponse(PaymentMethodResponseSchema)
  paymentMethods(@GetCurrentUserId() currentUserId: number) {
    return this.paymentsService.paymentMethods(currentUserId);
  }

  @Delete('methods/:id')
  @ApiBearerAuth()
  removePaymentMethod(@Param('id') id: string) {
    return this.paymentsService.removePaymentMethod(id);
  }

  @Post()
  @ApiBearerAuth()
  @ApiOkResponse(CreatePaymentResponseSchema)
  createPaymentIntent(
    @Body() dto: CreatePaymentDto,
    @GetCurrentUserId() currentUserId: number,
  ) {
    return this.paymentsService.create(dto, currentUserId);
  }

  @Get(':id')
  @ApiBearerAuth()
  findOnePaymentIntent(
    @Param('id') id: string,
    @GetCurrentUserId() currentUserId: number,
  ) {
    return this.paymentsService.findOne(id, currentUserId);
  }
}
