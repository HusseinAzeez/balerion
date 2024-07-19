import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseInterceptors,
  ParseIntPipe,
  UploadedFile,
  HttpStatus,
  Delete,
  Query,
  HttpCode,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { StaffsService } from './staffs.service';

import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Staff } from '@/db/entities/staff.entity';
import { ImageFileValidator } from '@/common/validators';
import { FileInterceptor } from '@nestjs/platform-express';
import { GetCurrentUserId, Public } from '@/common/decorators';
import { InviteStaffDto, ResendInviteStaffDto } from './dto/invite-staff.dto';
import { SetupStaffDto } from './dto/setup-staff-account.dto';
import {
  ImportUserSchema,
  SetupUserAdminSchema,
  UpdateStaffSchema,
} from './staffs.constant';
import { RejectCarDto } from '../cars/dto/reject-car.dto';
import { DeleteCarDto } from '../cars/dto/delete-car.dto';
import { QueryStaffDto } from './dto/query-user.dto';
import { StaffChangePasswordDto } from './dto/change-password.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { ReviewUserDto } from './dto/review-user.dto';
import { UpdateCarByStaffDto } from '../cars/dto/update-car-by-staff.dto';
import { QueryCarByStaffDto } from '../cars/dto/query-car-by-staff.dto';
import { FindByTokenDto } from './dto/find-by-token.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { QueryVoucherByStaffDto } from '../vouchers/dto/query-voucher-by-staff.dto';
import { Voucher } from '@/db/entities/voucher.entity';
import { UpdateVoucherSchema } from '../vouchers/vouchers.constant';
import { UpdateVoucherDto } from '../vouchers/dto/update-voucher.dto';
import { UpdateUserByStaffDto } from '../users/dto/update-user-by-staff.dto';
import { UpdateUserByStaffSchema } from '../users/users.constant';
import { User } from '@/db/entities/user.entity';
import { DeleteStaffDto } from './dto/delete-staffs.dto';
import { DeleteUserDto } from './dto/delete-users.dto';
import { InviteUserDto, ResendInviteDto } from './dto/invite-user.dto';
import { CreateCarByStaffDto } from '../cars/dto/create-car-by-staff.dto';
import { AddProductBalanceDto } from './dto/add-product-balance.dto';
import { StaffRole } from '@/common/enums/staff.eum';
import { UpdateRoleStaffDto } from './dto/update-role-staff.dto';

@ApiTags('Staffs')
@Controller('staffs')
export class StaffsController {
  constructor(private readonly staffsService: StaffsService) {}

  @Get('me')
  @ApiBearerAuth()
  async getProfile(@GetCurrentUserId() currentStaffId: number) {
    return this.staffsService.getProfile(currentStaffId);
  }

  @Get('find-by-token')
  @Public()
  async findByToken(@Query() dto: FindByTokenDto) {
    return this.staffsService.findByToken(dto);
  }

  @Post('cars')
  @ApiBearerAuth()
  async createCar(
    @Body() dto: CreateCarByStaffDto,
    @GetCurrentUserId() currentStaffId: number,
  ) {
    return this.staffsService.createCar(dto, currentStaffId);
  }

  @Patch('cars/move-to-bin')
  @ApiBearerAuth()
  async moveToBinCar(
    @Body() dto: DeleteCarDto,
    @GetCurrentUserId() currentStaffId: number,
  ) {
    return this.staffsService.moveToBinCar(dto, currentStaffId);
  }

  @Patch('cars/:id')
  @ApiBearerAuth()
  async updateCar(
    @Param(
      'id',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    id: number,
    @Body() dto: UpdateCarByStaffDto,
    @GetCurrentUserId() currentStaffId: number,
  ) {
    return this.staffsService.updateCar(id, dto, currentStaffId);
  }

  @Get('cars')
  @ApiBearerAuth()
  async findAllCars(
    @Query() query: QueryCarByStaffDto,
    @GetCurrentUserId() currentStaffId: number,
  ) {
    return this.staffsService.findAllCars(query, currentStaffId);
  }

  @Patch('cars/:id/publish')
  @ApiBearerAuth()
  async publishCar(
    @Param(
      'id',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    id: number,
    @GetCurrentUserId() currentStaffId: number,
  ) {
    return this.staffsService.publishCar(id, currentStaffId);
  }

  @Patch('cars/:id/reject')
  @ApiBearerAuth()
  async rejectCar(
    @Param(
      'id',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    id: number,
    @Body() dto: RejectCarDto,
    @GetCurrentUserId() currentStaffId: number,
  ) {
    return this.staffsService.rejectCar(id, dto, currentStaffId);
  }

  @Patch('vouchers/:id')
  @ApiBody(UpdateVoucherSchema)
  @ApiBearerAuth()
  async updateVoucher(
    @Param(
      'id',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    id: number,
    @Body() dto: UpdateVoucherDto,
    @GetCurrentUserId() currentStaffId: number,
  ) {
    return this.staffsService.updateVoucher(id, dto, currentStaffId);
  }

  @Get('vouchers')
  @ApiOkResponse({ type: Voucher, isArray: true })
  @ApiBearerAuth()
  async findAllVouchers(
    @Query() query: QueryVoucherByStaffDto,
    @GetCurrentUserId() currentStaffId: number,
  ) {
    return this.staffsService.findAllVouchers(query, currentStaffId);
  }

  @Post('invite')
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Invite emails have been sent',
    type: Staff,
  })
  async inviteStaffs(
    @Body() dto: InviteStaffDto,
    @GetCurrentUserId() currentStaffId: number,
  ) {
    return this.staffsService.inviteStaff(dto, currentStaffId);
  }

  @Patch('setup')
  @ApiConsumes('multipart/form-data')
  @Public()
  @ApiBody(SetupUserAdminSchema)
  @ApiOkResponse({
    description: "Staff's profile has been setup successfully",
    type: Staff,
  })
  @UseInterceptors(FileInterceptor('image', ImageFileValidator()))
  setupAccount(
    @UploadedFile() image: Express.Multer.File,
    @Body() dto: SetupStaffDto,
  ): any {
    return this.staffsService.setupStaffAccount(dto, image);
  }

  @Post('resend-invite')
  @ApiBearerAuth()
  async resendInvite(@Body() dto: ResendInviteStaffDto) {
    return this.staffsService.resendInvite(dto);
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOkResponse({ type: Staff })
  findOne(
    @Param('id')
    id: number,
  ) {
    return this.staffsService.findOne(+id);
  }

  @Get()
  @ApiBearerAuth()
  @ApiOkResponse({ type: Staff, isArray: true })
  findAll(@Query() query: QueryStaffDto) {
    return this.staffsService.findAll(query);
  }

  @Post('change-password')
  @ApiBearerAuth()
  @ApiOkResponse({ type: Staff })
  @ApiForbiddenResponse({ description: 'Forbidden.' })
  changePassword(
    @GetCurrentUserId() currentStaffId: number,
    @Body() dto: StaffChangePasswordDto,
  ) {
    return this.staffsService.changePassword(currentStaffId, dto);
  }
  @Delete('users')
  @ApiBearerAuth()
  @HttpCode(204)
  removeUsers(
    @Body() dto: DeleteUserDto,
    @GetCurrentUserId() currentStaffId: number,
  ) {
    this.staffsService.removeUsers(dto, currentStaffId);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @HttpCode(204)
  remove(@Param('id') id: string, @GetCurrentUserId() currentStaffId: number) {
    this.staffsService.remove(+id, currentStaffId);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody(UpdateStaffSchema)
  @ApiOkResponse({ type: Staff })
  @ApiForbiddenResponse({ description: 'Forbidden.' })
  @UseInterceptors(FileInterceptor('image', ImageFileValidator()))
  update(
    @Param(
      'id',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    id: number,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UpdateStaffDto,
  ) {
    return this.staffsService.update(+id, file, dto);
  }

  @Post(':email/forget-password')
  @Public()
  @ApiOkResponse({ type: Staff })
  async forgetPassword(@Param('email') email: string) {
    return this.staffsService.forgetPassword(email);
  }

  @Post('review-user')
  @ApiOkResponse({ type: Staff })
  @ApiBearerAuth()
  async reviewUser(
    @Body() dto: ReviewUserDto,
    @GetCurrentUserId() currentStaffId: number,
  ) {
    return this.staffsService.reviewUser(dto, currentStaffId);
  }

  @Patch('users/:id')
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody(UpdateUserByStaffSchema)
  @ApiOkResponse({ type: User })
  @ApiForbiddenResponse({ description: 'Forbidden.' })
  @UseInterceptors(FileInterceptor('image', ImageFileValidator()))
  async updateUser(
    @Param(
      'id',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    id: number,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UpdateUserByStaffDto,
    @GetCurrentUserId() currentStaffId: number,
  ) {
    return this.staffsService.updateUser(id, dto, file, currentStaffId);
  }

  @Post('reset-password')
  @Public()
  @ApiOkResponse({ type: Staff })
  async resetPassword(
    @Body()
    dto: ResetPasswordDto,
  ) {
    return this.staffsService.resetPassword(dto);
  }

  @Patch('/users/reactive/:id')
  @ApiBearerAuth()
  @ApiOkResponse({ type: User })
  @ApiForbiddenResponse({ description: 'Forbidden.' })
  reactiveDealer(
    @Param(
      'id',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    id: number,
    @GetCurrentUserId() currentStaffId: number,
  ) {
    return this.staffsService.reactiveDealer(+id, currentStaffId);
  }

  @Delete('')
  @ApiBearerAuth()
  @HttpCode(204)
  removeStaffs(
    @Body() dto: DeleteStaffDto,
    @GetCurrentUserId() currentStaffId: number,
  ) {
    return this.staffsService.removeStaffs(dto, currentStaffId);
  }

  @Delete('users/:id')
  @ApiBearerAuth()
  @HttpCode(204)
  removeUser(
    @Param('id') id: string,
    @GetCurrentUserId() currentStaffId: number,
  ) {
    this.staffsService.removeUser(+id, currentStaffId);
  }

  @Post('/users/invite')
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'All Emails have been sent',
    type: User,
  })
  async inviteUsers(
    @Body() dto: InviteUserDto,
    @GetCurrentUserId() currentStaffId: number,
  ) {
    return this.staffsService.inviteUsers(dto, currentStaffId);
  }

  @Post('/users/resend-invite')
  @ApiBearerAuth()
  async resendInviteUsers(
    @Body() dto: ResendInviteDto,
    @GetCurrentUserId() currentStaffId: number,
  ) {
    return this.staffsService.resendInviteUsers(dto, currentStaffId);
  }

  @Post('/users/:id/resend-verify')
  @ApiBearerAuth()
  async resendVerifyUser(
    @Param('id') id: number,
    @GetCurrentUserId() currentStaffId: number,
  ) {
    return this.staffsService.resendVerifyUser(id, currentStaffId);
  }

  @Patch('/users/:id/deactivate')
  @ApiBearerAuth()
  async deactivateUser(
    @Param('id') id: number,
    @GetCurrentUserId() currentStaffId: number,
  ) {
    return this.staffsService.deactivateUser(id, currentStaffId);
  }

  @Get('/users/invite/download-template')
  @ApiBearerAuth()
  @ApiOkResponse({
    schema: {
      type: 'string',
      format: 'binary',
    },
  })
  exportInviteTemplate(@Res() res: Response) {
    const file = this.staffsService.exportInviteTemplate();
    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename=import-users.xlsx',
    });

    res.send(Buffer.from(file, 'base64'));
  }

  @Post('/users/invite/import')
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('file'))
  @ApiBody(ImportUserSchema)
  @ApiConsumes('multipart/form-data')
  async ImportInviteUser(
    @UploadedFile() file: Express.Multer.File,
    @GetCurrentUserId() currentStaffId: number,
  ) {
    if (!file) {
      throw new Error('No file uploaded');
    }
    return await this.staffsService.ImportInviteTemplate(file, currentStaffId);
  }

  @Patch('/users/:id/add/product-balance')
  @ApiBearerAuth()
  async AddProductBalance(
    @Param(
      'id',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    id: number,
    @Body() dto: AddProductBalanceDto,
    @GetCurrentUserId() currentStaffId: number,
  ) {
    return await this.staffsService.AddProductBalance(id, dto, currentStaffId);
  }

  @Patch('notifications/:id/read')
  @ApiBearerAuth()
  async setReadNotification(
    @Param('id')
    id: string,
    @GetCurrentUserId() currentStaffId: number,
  ) {
    return this.staffsService.setReadNotification(id, currentStaffId);
  }

  @Patch('notifications/mark-all-as-read')
  @ApiBearerAuth()
  async markAllAsReadNotification(@GetCurrentUserId() currentStaffId: number) {
    return this.staffsService.markAllAsReadNotification(currentStaffId);
  }

  @Patch(':id/change-role')
  @ApiBearerAuth()
  async changeRole(
    @Param('id') id: string,
    @Body() dto: UpdateRoleStaffDto,
    @GetCurrentUserId() currentStaffId: number,
  ) {
    return this.staffsService.changeRole(+id, currentStaffId, dto);
  }
}
