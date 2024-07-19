import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  UseInterceptors,
  UploadedFile,
  Delete,
} from '@nestjs/common';
import { VouchersService } from './vouchers.service';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { GetCurrentUserId, Public } from '@/common/decorators';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  CreateVoucherSchema,
  UploadVoucherAttachmentSchema,
} from './vouchers.constant';
import { Voucher } from '@/db/entities/voucher.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { AttachmentFileValidator } from '@/common/validators';
import { UploadVoucherAttachmentDto } from './dto/upload-voucher-attachment.dto';

@ApiTags('Vouchers')
@Controller('vouchers')
export class VouchersController {
  constructor(private readonly vouchersService: VouchersService) {}

  @Post()
  @ApiBearerAuth()
  @ApiBody(CreateVoucherSchema)
  @ApiCreatedResponse({ type: Voucher })
  @ApiBadRequestResponse({
    description:
      'User id #1 not have enough carsmeup certified balance / Car plate number GG-3333 has already activated RSA voucher.',
  })
  @ApiNotFoundResponse({ description: 'Car id #1 not found' })
  create(
    @Body() createVoucherDto: CreateVoucherDto,
    @GetCurrentUserId() currentUserId: number,
  ) {
    return this.vouchersService.create(createVoucherDto, currentUserId);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.vouchersService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.vouchersService.remove(+id);
  }

  @Patch(':id/redeem')
  @ApiBearerAuth()
  redeem(@Param('id') id: string) {
    return this.vouchersService.redeem(+id);
  }

  @Public()
  @Patch(':uid/confirm')
  confirm(@Param('uid') uid: string) {
    return this.vouchersService.confirm(uid);
  }

  @Post('attachments')
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody(UploadVoucherAttachmentSchema)
  @UseInterceptors(
    FileInterceptor('file', AttachmentFileValidator(/\.(jpeg|jpg|png|pdf)$/i)),
  )
  async uploadAttachment(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadVoucherAttachmentDto,
  ) {
    return this.vouchersService.uploadAttachment(file, dto);
  }
}
