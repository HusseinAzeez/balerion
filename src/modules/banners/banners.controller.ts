import { GetCurrentUserId, Public } from '@/common/decorators';
import { ImageFileValidator } from '@/common/validators';
import { Banner } from '@/db/entities/banner.entity';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFiles,
  Query,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateBannerSchema, UpdateBannerSchema } from './banners.constant';
import { BannersService } from './banners.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { QueryBannerDto } from './dto/query-banner.dto';
import { QueryPublishedBannerDto } from './dto/query-published-banner.dto';
import { QueryRescheduleBanner } from './dto/query-reschedule-banner.dto';
import { UpdateBannerRunningNoList } from './dto/update-banner-runnung-no-list.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';

@ApiTags('Banners')
@Controller('banners')
export class BannersController {
  constructor(private readonly bannersService: BannersService) {}

  @Get('published')
  @Public()
  @ApiOkResponse({ type: Banner, isArray: true })
  findPublishedBanners(@Query() dto: QueryPublishedBannerDto) {
    return this.bannersService.findPublishedBanners(dto);
  }

  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBearerAuth()
  @ApiBody(CreateBannerSchema)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'desktopImage', maxCount: 1 },
        { name: 'mobileImage', maxCount: 1 },
      ],
      ImageFileValidator(),
    ),
  )
  create(
    @Body() dto: CreateBannerDto,
    @UploadedFiles()
    images: {
      desktopImage?: Express.Multer.File[];
      mobileImage?: Express.Multer.File[];
    },
  ) {
    return this.bannersService.create(dto, images);
  }

  @Get(':id')
  @ApiBearerAuth()
  findOne(@Param('id') id: number) {
    return this.bannersService.findOne(id);
  }

  @Patch('update-running-no')
  @ApiBearerAuth()
  updateBannerList(
    @Body() dto: UpdateBannerRunningNoList,
    @GetCurrentUserId() currentStaffId: number,
  ) {
    return this.bannersService.updateRunningNoList(dto, currentStaffId);
  }

  @Patch(':id')
  @ApiConsumes('multipart/form-data')
  @ApiBearerAuth()
  @ApiBody(UpdateBannerSchema)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'desktopImage', maxCount: 1 },
        { name: 'mobileImage', maxCount: 1 },
      ],
      ImageFileValidator(),
    ),
  )
  update(
    @Param('id') id: number,
    @Body() updateBannerDto: UpdateBannerDto,
    @UploadedFiles()
    images: {
      desktopImage?: Express.Multer.File[];
      mobileImage?: Express.Multer.File[];
    },
  ) {
    return this.bannersService.update(id, updateBannerDto, images);
  }

  @Delete(':id')
  @ApiBearerAuth()
  remove(@Param('id') id: number) {
    return this.bannersService.remove(id);
  }

  @Get()
  @ApiBearerAuth()
  @ApiOkResponse({ type: Banner, isArray: true })
  findAll(@Query() query: QueryBannerDto) {
    return this.bannersService.findAll(query);
  }

  @Patch(':id/draft')
  @ApiBearerAuth()
  draft(@Param('id') id: number) {
    return this.bannersService.draft(id);
  }

  @Patch(':id/reschedule')
  @ApiBearerAuth()
  reschedule(@Param('id') id: number, @Body() dto: QueryRescheduleBanner) {
    return this.bannersService.reschedule(id, dto);
  }

  @Patch(':id/publish')
  @ApiBearerAuth()
  published(@Param('id') id: number) {
    return this.bannersService.publish(id);
  }

  @Patch(':id/unpublish')
  @ApiBearerAuth()
  unpublish(@Param('id') id: number) {
    return this.bannersService.unpublish(id);
  }
}
