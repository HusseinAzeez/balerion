import { FileInterceptor } from '@nestjs/platform-express';
import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  Query,
  Post,
  ForbiddenException,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiForbiddenResponse,
  ApiTags,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';

import { User } from '@/db/entities/user.entity';
import {
  DealerPP20FileValidator,
  ImageFileValidator,
} from '@/common/validators';
import { GetCurrentUser, GetCurrentUserId, Public } from '@/common/decorators';
import { UsersService } from './users.service';
import {
  UpdateUserDto,
  SetupAccountDto,
  QueryUserDto,
  CreateUsersDto,
  ChangePasswordDto,
} from './dto';
import {
  CreateUserSocialSchema,
  CreateUsersSchema,
  SetupUserSchema,
  UpdateUserSchema,
  UploadUserAttachmentSchema,
} from './users.constant';
import { RegisterUserDto } from './dto/register-user.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { DeleteCarDto } from '../cars/dto/delete-car.dto';
import { UploadUserAttachmentDto } from './dto/upload-user-attachment.dto';
import { UpdateCarByUserDto } from '../cars/dto/update-car-by-user.dto';
import { QueryCarByUserDto } from '../cars/dto/query-car-by-user.dto';
import { FindByTokenDto } from './dto/find-by-token.dto';
import { CreateSaveCarDto } from '../save-cars/dto/create-save-car.dto';
import { QuerySaveCarDto } from '../cars/dto/query-save-car.dto';
import { RemoveSaveCarDto } from '../save-cars/dto/remove-save-car.dto';
import { Car } from '@/db/entities/car.entity';
import { Voucher } from '@/db/entities/voucher.entity';
import { QueryVoucherByUserDto } from '../vouchers/dto/query-voucher-by-user.dto';
import { FacebookGuard } from '@/common/guards/facebook.guard';
import { CreateUserSocialDto } from './dto/create-user-social.dto';
import { ISocialProfile } from '@/common/interfaces/user.interface';
import { GoogleGuard } from '@/common/guards/google.guard';
import { CreateCarByUserDto } from '../cars/dto/create-car-by-user.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id/vouchers')
  @ApiBearerAuth()
  @ApiOkResponse({ type: Voucher, isArray: true })
  findAllVouchers(
    @Param(
      'id',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    id: number,
    @Query() query: QueryVoucherByUserDto,
  ) {
    return this.usersService.findAllVouchers(+id, query);
  }

  @Patch('cars/move-to-bin')
  @ApiBearerAuth()
  async moveToBinCar(
    @Body() dto: DeleteCarDto,
    @GetCurrentUserId() currentUserId: number,
  ) {
    return this.usersService.moveToBinCar(dto, currentUserId);
  }

  @Post('cars')
  @ApiBearerAuth()
  async createCar(
    @Body() dto: CreateCarByUserDto,
    @GetCurrentUserId() currentUserId: number,
  ) {
    return this.usersService.createCar(dto, currentUserId);
  }

  @Patch('cars/:id')
  @ApiBearerAuth()
  async updateCar(
    @Param(
      'id',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    id: number,
    @Body() dto: UpdateCarByUserDto,
    @GetCurrentUserId() currentUserId: number,
  ) {
    return this.usersService.updateCar(id, dto, currentUserId);
  }

  @Get('find-by-token')
  @Public()
  async findByToken(@Query() dto: FindByTokenDto) {
    return this.usersService.findByToken(dto);
  }

  @Get(':id/cars')
  @ApiBearerAuth()
  async findAllCars(
    @Param(
      'id',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    id: number,
    @Query() query: QueryCarByUserDto,
  ) {
    return this.usersService.findAllCars(id, query);
  }

  @Delete('cars')
  @ApiBearerAuth()
  async removeCar(
    @Body() dto: DeleteCarDto,
    @GetCurrentUserId() currentUserId: number,
  ) {
    return this.usersService.removeCar(dto, currentUserId);
  }

  @Get('save-cars')
  @ApiBearerAuth()
  @ApiOkResponse({ type: Car, isArray: true })
  findAllSaveCars(
    @Query() query: QuerySaveCarDto,
    @GetCurrentUserId() currentUserId: number,
  ) {
    return this.usersService.findAllUserSaveCars(query, currentUserId);
  }

  @Patch('notifications/mark-all-as-read')
  @ApiBearerAuth()
  markAllAsReadNotifications(@GetCurrentUserId() currentUserId: number) {
    return this.usersService.markAllAsReadNotifications(currentUserId);
  }

  @Patch('notifications/:id/read')
  @ApiBearerAuth()
  setReadNotification(
    @Param('id')
    id: string,
    @GetCurrentUserId() currentUserId: number,
  ) {
    return this.usersService.setReadNotification(id, currentUserId);
  }

  @Get('save-cars/:id')
  @ApiBearerAuth()
  @ApiOkResponse({ type: Car, isArray: true })
  findOneSaveCar(
    @Param('id') id: string,
    @GetCurrentUserId() currentUserId: number,
  ) {
    return this.usersService.findOneUserSaveCar(+id, currentUserId);
  }

  @Post('save-cars')
  @ApiBearerAuth()
  @ApiBadRequestResponse({ description: 'User 1 already save car 1.' })
  createSaveCar(
    @Body() createSaveCarDto: CreateSaveCarDto,
    @GetCurrentUserId() currentUserId: number,
  ) {
    return this.usersService.createSaveCar(createSaveCarDto, currentUserId);
  }

  @Delete('save-cars')
  @ApiBearerAuth()
  @ApiNotFoundResponse({
    description: 'User 1 never save car 1.',
  })
  removeSaveCar(
    @Body() removeSaveCarDto: RemoveSaveCarDto,
    @GetCurrentUserId() currentUserId: number,
  ) {
    return this.usersService.removeSaveCar(currentUserId, removeSaveCarDto);
  }

  @Post('register')
  @Public()
  @ApiOkResponse({ type: User })
  register(@Body() dto: RegisterUserDto) {
    return this.usersService.register(dto);
  }

  @Post('facebook/register')
  @Public()
  @ApiConsumes('multipart/form-data')
  @ApiOkResponse({
    description: "User's profile has been setup successfully",
    type: User,
  })
  @ApiBody(CreateUserSocialSchema)
  @UseInterceptors(FileInterceptor('image', ImageFileValidator()))
  @UseGuards(FacebookGuard)
  registerWithFacebook(
    @UploadedFile() image: Express.Multer.File,
    @Body() dto: CreateUserSocialDto,
    @GetCurrentUser() user: ISocialProfile,
  ) {
    return this.usersService.createAccountWithSocial(dto, user, image);
  }

  @Post('google/register')
  @Public()
  @ApiConsumes('multipart/form-data')
  @ApiOkResponse({
    description: "User's profile has been setup successfully",
    type: User,
  })
  @ApiBody(CreateUserSocialSchema)
  @UseInterceptors(FileInterceptor('image', ImageFileValidator()))
  @UseGuards(GoogleGuard)
  registerWithGoogle(
    @UploadedFile() image: Express.Multer.File,
    @Body() dto: CreateUserSocialDto,
    @GetCurrentUser() user: ISocialProfile,
  ) {
    return this.usersService.createAccountWithSocial(dto, user, image);
  }

  @Post('')
  @ApiBearerAuth()
  @ApiBody(CreateUsersSchema)
  @ApiOkResponse({
    description: 'Users have been created successfully',
    type: User,
  })
  create(@Body() dto: CreateUsersDto) {
    return this.usersService.create(dto);
  }

  @Patch('setup')
  @Public()
  @ApiConsumes('multipart/form-data')
  @ApiBody(SetupUserSchema)
  @ApiOkResponse({
    description: "User's profile has been setup successfully",
    type: User,
  })
  @UseInterceptors(FileInterceptor('image', ImageFileValidator()))
  setupAccount(
    @UploadedFile() image: Express.Multer.File,
    @Body() dto: SetupAccountDto,
  ) {
    return this.usersService.setupAccount(dto, image);
  }

  //API for Admin
  @Get()
  @ApiBearerAuth()
  @ApiOkResponse({ type: User, isArray: true })
  findAll(@Query() query: QueryUserDto) {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOkResponse({ type: User })
  findOne(
    @Param(
      'id',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    id: number,
  ) {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody(UpdateUserSchema)
  @ApiOkResponse({ type: User })
  @ApiForbiddenResponse({ description: 'Forbidden.' })
  @UseInterceptors(FileInterceptor('image', ImageFileValidator()))
  update(
    @Param(
      'id',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    id: number,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UpdateUserDto,
    @GetCurrentUserId() currentUserId: number,
  ) {
    if (currentUserId !== id)
      throw new ForbiddenException('Only owner allow to update information.');
    return this.usersService.update(+id, file, dto);
  }

  @Post('change-password')
  @ApiBearerAuth()
  @ApiOkResponse({ type: User })
  @ApiForbiddenResponse({ description: 'Forbidden.' })
  changePassword(
    @GetCurrentUserId() currentUserId: number,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.usersService.changePassword(currentUserId, dto);
  }

  @Public()
  @Post('attachments')
  @ApiConsumes('multipart/form-data')
  @ApiBody(UploadUserAttachmentSchema)
  @UseInterceptors(FileInterceptor('file', DealerPP20FileValidator()))
  async uploadDealerImage(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadUserAttachmentDto,
  ) {
    return this.usersService.uploadAttachment(file, dto);
  }

  @Public()
  @Post(':email/forget-password')
  @ApiOkResponse({ type: User })
  async forgetPassword(
    @Param('email')
    email: string,
  ) {
    return this.usersService.forgetPassword(email);
  }

  @Post('reset-password')
  @Public()
  @ApiOkResponse({ type: User })
  async resetPassword(
    @Body()
    dto: ResetPasswordDto,
  ) {
    return this.usersService.resetPassword(dto);
  }

  @Post(':id/resend-verify')
  @Public()
  async resendVerifyUser(@Param('id') id: number) {
    return this.usersService.resendVerifyUser(id);
  }
}
