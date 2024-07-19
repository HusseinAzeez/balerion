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
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(private readonly httpService: HttpService) {
    super();
  }

  async validate(request: Request): Promise<ISocialProfile> {
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    const fields = encodeURIComponent('email,first_name,last_name');
    const url = `https://graph.facebook.com/me?access_token=${token}&fields=${fields}`;
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(url).pipe(
          catchError((error: AxiosError) => {
            throw error.response.data;
          }),
        ),
      );
      return {
        uid: data.id,
        email: data.email,
        firstName: data.first_name,
        lastName: data.last_name,
        providerType: UserAuthProvider.FACEBOOK,
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
