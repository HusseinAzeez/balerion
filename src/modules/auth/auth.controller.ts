import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';

import {
  Public,
  GetCurrentUserId,
  GetCurrentUser,
} from '../../common/decorators';
import { RtGuard } from '../../common/guards';
import { AuthService } from './auth.service';
import { AuthDto, VerifyUserOtpDto } from './dto';
import { ResendStaffOTPDto } from './dto/resend-staff-otp.dto';
import { VerifyStaffOtpDto } from './dto/verify-staff-token.dto';
import { Tokens } from './types';
import { FacebookGuard } from '@/common/guards/facebook.guard';
import { ISocialProfile } from '@/common/interfaces/user.interface';
import { GoogleGuard } from '@/common/guards/google.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('users/login')
  @ApiOkResponse({
    description: '',
    schema: {
      type: 'object',
      required: ['accessToken', 'refreshToken'],
      properties: {
        accessToken: {
          type: 'string',
        },
        refreshToken: {
          type: 'string',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description:
      'Invalid credentials. The provided username or password do not match an existing user',
  })
  userLogin(@Body() dto: AuthDto): Promise<Tokens> {
    return this.authService.login(dto);
  }

  @Public()
  @Post('staffs/verify-otp')
  @ApiOkResponse({
    description: '',
    schema: {
      type: 'object',
      required: ['accessToken', 'refreshToken'],
      properties: {
        accessToken: {
          type: 'string',
        },
        refreshToken: {
          type: 'string',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description:
      'Invalid credentials. The provided OTP do not match an existing staff',
  })
  verifyStaff(@Body() dto: VerifyStaffOtpDto): Promise<Tokens> {
    return this.authService.verifyStaff(dto);
  }

  @Public()
  @Post('staffs/login')
  @ApiBadRequestResponse({
    description:
      'Invalid credentials. The provided username or password do not match an existing user',
  })
  staffLogin(@Body() dto: AuthDto) {
    return this.authService.staffLogin(dto);
  }

  @Post('users/logout')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  logout(@GetCurrentUserId() userId: number): Promise<boolean> {
    return this.authService.logout(userId);
  }

  @Post('staffs/logout')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  staffLogout(@GetCurrentUserId() userId: number): Promise<boolean> {
    return this.authService.staffLogout(userId);
  }

  @Public()
  @UseGuards(RtGuard)
  @Post('users/refresh')
  @ApiBearerAuth()
  @ApiOkResponse({
    description: '',
    schema: {
      type: 'object',
      required: ['accessToken', 'refreshToken'],
      properties: {
        accessToken: {
          type: 'string',
        },
        refreshToken: {
          type: 'string',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description:
      "Invalid refresh token. The provided refresh token does not match the user's stored refersh token",
  })
  refreshTokens(
    @GetCurrentUserId() userId: number,
    @GetCurrentUser('refreshToken') refreshToken: string,
  ): Promise<Tokens> {
    return this.authService.refreshTokens(userId, refreshToken);
  }

  @Public()
  @UseGuards(RtGuard)
  @Post('staffs/refresh')
  @ApiBearerAuth()
  @ApiOkResponse({
    description: '',
    schema: {
      type: 'object',
      required: ['accessToken', 'refreshToken'],
      properties: {
        accessToken: {
          type: 'string',
        },
        refreshToken: {
          type: 'string',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description:
      "Invalid refresh token. The provided refresh token does not match the staff's stored refersh token",
  })
  staffRefreshTokens(
    @GetCurrentUserId() userId: number,
    @GetCurrentUser('refreshToken') refreshToken: string,
  ): Promise<Tokens> {
    return this.authService.staffRefreshTokens(userId, refreshToken);
  }

  @Public()
  @Post('staffs/resend-otp')
  resendOtp(@Body() dto: ResendStaffOTPDto) {
    return this.authService.resendOtp(dto);
  }

  @Post('users/otp/request')
  @ApiCreatedResponse({
    schema: {
      type: 'object',
      required: ['status', 'token', 'refno'],
      properties: {
        status: {
          type: 'string',
        },
        token: {
          type: 'string',
        },
        refno: {
          type: 'string',
        },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Invalid Parameter.' })
  requestOtp(@GetCurrentUserId() currentUserId: number) {
    return this.authService.requestOTP(currentUserId);
  }

  @Post('users/otp/verify')
  @ApiCreatedResponse({
    schema: {
      type: 'object',
      required: ['status', 'message'],
      properties: {
        status: {
          type: 'string',
        },
        message: {
          type: 'string',
        },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Invalid Parameter.' })
  verifyOtp(
    @Body() dto: VerifyUserOtpDto,
    @GetCurrentUserId() currentUserId: number,
  ) {
    return this.authService.verifyOtp(dto, currentUserId);
  }

  @Get('users/otp/is-verified')
  @ApiOkResponse({
    schema: {
      type: 'object',
      required: ['verified'],
      properties: {
        verified: {
          type: 'boolean',
        },
      },
    },
  })
  isVerified(@GetCurrentUserId() currentUserId: number) {
    return this.authService.isVerified(currentUserId);
  }

  @Public()
  @Post('users/facebook')
  @ApiOkResponse({
    description: '',
    schema: {
      type: 'object',
      required: ['accessToken', 'refreshToken'],
      properties: {
        accessToken: {
          type: 'string',
        },
        refreshToken: {
          type: 'string',
        },
      },
    },
  })
  @ApiBearerAuth()
  @UseGuards(FacebookGuard)
  loginWithFacebook(@GetCurrentUser() user: ISocialProfile) {
    return this.authService.loginWithSocial(user);
  }

  @Public()
  @Post('users/google')
  @ApiOkResponse({
    description: '',
    schema: {
      type: 'object',
      required: ['accessToken', 'refreshToken'],
      properties: {
        accessToken: {
          type: 'string',
        },
        refreshToken: {
          type: 'string',
        },
      },
    },
  })
  @ApiBearerAuth()
  @UseGuards(GoogleGuard)
  loginWithGoogle(@GetCurrentUser() user: ISocialProfile) {
    return this.authService.loginWithSocial(user);
  }
}
