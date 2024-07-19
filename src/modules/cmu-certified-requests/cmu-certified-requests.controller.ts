import { GetCurrentUserId, Public } from '@/common/decorators';
import { DealerPP20FileValidator } from '@/common/validators';
import { CmuCertifiedRequest } from '@/db/entities/cmu-certified-request.entity';
import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Query,
  Post,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
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
  CreateCMUCertifiedRequestSchema,
  ReviewCMUCertifiedRequestSchema,
  UploadCMUCertifiedRequestAttachmentSchema,
} from './cmu-certified-requests.constant';
import { CmuCertifiedRequestsService } from './cmu-certified-requests.service';
import { CreateCmuCertifiedRequestDto } from './dto/create-cmu-certified-request.dto';
import { QueryCmuCertifiedRequest } from './dto/query-cmu-certified-request.dto';
import { ReviewCmuCertifiedRequest } from './dto/review-cmu-certified-request.dto';
import { UpdateCmuCertifiedRequestDto } from './dto/update-cmu-certified-request.dto';
import { UploadCMUCertifiedRequestAttachmentDto } from './dto/upload-cmu-certified-request-attachment.dto';

@ApiTags('CMU certified requests')
@Controller('cmu-certified-requests')
export class CmuCertifiedRequestsController {
  constructor(
    private readonly cmuCertifiedRequestsService: CmuCertifiedRequestsService,
  ) {}

  @Post()
  @ApiBearerAuth()
  @ApiBody(CreateCMUCertifiedRequestSchema)
  @ApiCreatedResponse({ type: CmuCertifiedRequest, isArray: true })
  @ApiNotFoundResponse({ description: 'Car id #1 not found' })
  @ApiBadRequestResponse({
    description:
      'User id #1 not have enough carsmeup certified balance / Car plate number GG-3333 has already activated RSA voucher.',
  })
  create(
    @Body() dto: CreateCmuCertifiedRequestDto,
    @GetCurrentUserId() currentUserId: number,
  ) {
    return this.cmuCertifiedRequestsService.create(dto, currentUserId);
  }

  @Get()
  @ApiBearerAuth()
  findAll(@Query() query: QueryCmuCertifiedRequest) {
    return this.cmuCertifiedRequestsService.findAll(query);
  }

  @Get(':id')
  @ApiBearerAuth()
  findOne(@Param('id') id: string) {
    return this.cmuCertifiedRequestsService.findOne(+id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  update(@Param('id') id: string, @Body() dto: UpdateCmuCertifiedRequestDto) {
    return this.cmuCertifiedRequestsService.update(+id, dto);
  }

  @Patch(':id/staffs/review')
  @ApiBody(ReviewCMUCertifiedRequestSchema)
  @ApiBearerAuth()
  review(
    @Param('id') id: string,
    @Body() dto: ReviewCmuCertifiedRequest,
    @GetCurrentUserId() currentStaffId: number,
  ) {
    return this.cmuCertifiedRequestsService.review(+id, dto, currentStaffId);
  }

  @Public()
  @Post('attachment')
  @ApiConsumes('multipart/form-data')
  @ApiBody(UploadCMUCertifiedRequestAttachmentSchema)
  @UseInterceptors(FileInterceptor('file', DealerPP20FileValidator()))
  async uploadAttachment(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadCMUCertifiedRequestAttachmentDto,
  ) {
    return this.cmuCertifiedRequestsService.uploadAttachment(file, dto);
  }
}
