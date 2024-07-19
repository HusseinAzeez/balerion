import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
  Patch,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';

import { GetCurrentUserId, Public } from '@/common/decorators';
import { CarsService } from './cars.service';
import { UploadCarAttachmentSchema } from './cars.constant';
import { QueryCarDto } from './dto/query-car.dto';
import { QueryModelDto } from './dto/query-model.dto';
import { QuerySubModelDto } from './dto/query-sub-model.dto';
import { QueryBrandDto } from './dto/query-brand.dto';
import { QueryYearDto } from './dto/query-year.dto';
import { QueryFuelTypeDto } from './dto/query-fuel-type.dto';
import { QueryEngineDto } from './dto/query-engine.dto';
import { QueryBodyTypeDto } from './dto/query-body-type.dto';
import { QueryTransmissionDto } from './dto/query-transmission.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { AttachmentFileValidator } from '@/common/validators';
import { UploadCarAttachmentDto } from './dto/upload-car-attachment.dto';
import { QueryMonthlyInstallmentDto } from './dto/query-monthly-installment.dto';
import { QueryMarketpriceDto } from './dto/query-marketprice.dto';
import { QueryEquipmentDto } from './dto/query-equipment.dto';
import { SellCarDto } from './dto/sell-car.dto';
import { ApplyHotDealDto } from './dto/apply-hot-deal.dto';
import { ApplyBumpDto } from './dto/apply-bump.dto';
import { QueryCarHotDealDto } from './dto/query-car-hot-deal.dto';
import { ApplyLoanInformation } from './dto/apply-loan-information.dto';
import { QueryLifestyleDto } from './dto/query-lifestyle.dto';

@ApiTags('Cars')
@Controller('cars')
export class CarsController {
  constructor(private readonly carsService: CarsService) {}

  @Public()
  @Get('brands')
  async brands(@Query() query: QueryBrandDto) {
    return this.carsService.brands(query);
  }

  @Public()
  @Get('models')
  async models(@Query() query: QueryModelDto) {
    return this.carsService.models(query);
  }

  @Public()
  @Get('years')
  async years(@Query() query: QueryYearDto) {
    return this.carsService.years(query);
  }

  @Public()
  @Get('sub-models')
  async subModels(@Query() query: QuerySubModelDto) {
    return this.carsService.subModels(query);
  }

  @Public()
  @Get('transmissions')
  async transmissions(@Query() query: QueryTransmissionDto) {
    return this.carsService.transmissions(query);
  }

  @Public()
  @Get('fuel-types')
  async fuelTypes(@Query() query: QueryFuelTypeDto) {
    return this.carsService.fuelTypes(query);
  }

  @Public()
  @Get('body-types')
  async bodyTypes(@Query() query: QueryBodyTypeDto) {
    return this.carsService.bodyTypes(query);
  }

  @Public()
  @Get('engines')
  async engines(@Query() query: QueryEngineDto) {
    return this.carsService.engines(query);
  }

  @Public()
  @Get('lifestyles')
  async lifestyles(@Query() query: QueryLifestyleDto) {
    return this.carsService.lifestyles(query);
  }

  @Public()
  @Get('equipments')
  async equipments(@Query() query: QueryEquipmentDto) {
    return this.carsService.equipments(query);
  }

  @Public()
  @Get('marketprices')
  async marketprices(@Query() query: QueryMarketpriceDto) {
    return this.carsService.marketprices(query);
  }

  @Patch(':id/unpublish')
  @ApiBearerAuth()
  async unpublish(@Param('id') id: string) {
    return this.carsService.unpublish(+id);
  }

  @Patch(':id/republish')
  @ApiBearerAuth()
  async republish(@Param('id') id: string) {
    return this.carsService.republish(+id);
  }

  @Patch(':id/reserve')
  @ApiBearerAuth()
  async reserve(@Param('id') id: string) {
    return this.carsService.reserve(+id);
  }

  @Patch(':id/unreserve')
  @ApiBearerAuth()
  async unreserve(@Param('id') id: string) {
    return this.carsService.unreserve(+id);
  }

  @Patch(':id/sell')
  @ApiBearerAuth()
  async sell(@Param('id') id: string, @Body() dto: SellCarDto) {
    return this.carsService.sell(+id, dto);
  }

  @Patch(':id/recover')
  @ApiBearerAuth()
  async recover(@Param('id') id: string) {
    return this.carsService.recover(+id);
  }

  @Patch(':id/pending')
  @ApiBearerAuth()
  async pending(@Param('id') id: string) {
    return this.carsService.pending(+id);
  }

  @Patch(':id/cancel')
  @ApiBearerAuth()
  async cancel(@Param('id') id: string) {
    return this.carsService.cancel(+id);
  }

  @Patch('hot-deals')
  @ApiBearerAuth()
  async applyHotDeals(
    @Body() dto: ApplyHotDealDto,
    @GetCurrentUserId() currentUserId: number,
  ) {
    return this.carsService.applyHotDeals(dto, currentUserId);
  }

  @Public()
  @Get('hot-deals')
  async findHotDeals(@Query() query: QueryCarHotDealDto) {
    return this.carsService.findHotDeals(query);
  }

  @Patch('bumps')
  @ApiBearerAuth()
  async applyBumps(
    @Body() dto: ApplyBumpDto,
    @GetCurrentUserId() currentUserId: number,
  ) {
    return this.carsService.applyBumps(dto, currentUserId);
  }

  @Public()
  @Get(':id/monthly-installments')
  async monthlyInstallment(
    @Param('id') id: string,
    @Query() query: QueryMonthlyInstallmentDto,
  ) {
    return this.carsService.monthlyInstallment(+id, query);
  }

  @Public()
  @Get(':id/similar')
  async findSimilar(@Param('id') id: number) {
    return this.carsService.findSimilarCars(id);
  }

  @Public()
  @Get()
  async findAll(@Query() query: QueryCarDto) {
    return this.carsService.findAll(query);
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.carsService.findOne(+id);
  }

  @Post('attachments')
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody(UploadCarAttachmentSchema)
  @UseInterceptors(FileInterceptor('file', AttachmentFileValidator()))
  async uploadAttachment(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadCarAttachmentDto,
  ) {
    return this.carsService.uploadAttachment(file, dto);
  }

  @Post('/apply-for-loan')
  @Public()
  async sendApplyForLoanEmail(@Body() dto: ApplyLoanInformation) {
    return this.carsService.applyForLoan(dto);
  }
}
