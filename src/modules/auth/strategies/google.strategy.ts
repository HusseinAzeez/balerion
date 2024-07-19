import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { Request } from 'express';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { ISocialProfile } from '@/common/interfaces/user.interface';
import { UserAuthProvider } from '@/common/enums/user.enum';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly httpService: HttpService) {
    super();
  }

  async validate(request: Request): Promise<ISocialProfile> {
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    const url = `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${token}`;
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(url).pipe(
          catchError((error: AxiosError) => {
            throw error.response.data;
          }),
        ),
      );
      return {
        uid: data.sub,
        email: data.email,
        firstName: data.given_name,
        lastName: data.family_name,
        pictureUrl: data.picture,
        providerType: UserAuthProvider.GOOGLE,
      };
    } catch (error) {
      throw new UnauthorizedException(error?.error?.message ?? 'invalid token');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
