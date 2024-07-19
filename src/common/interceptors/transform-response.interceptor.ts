import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { GlobalResponse } from '../interfaces/globalResponse.interface';
import { Meta } from '../interfaces/meta.interface';

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, GlobalResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<GlobalResponse<T>> {
    return next.handle().pipe(
      map((response) => {
        const data = response?.data ? response.data : response;

        let totalItems: number;
        if (Array.isArray(data)) {
          totalItems = data.length;
        } else {
          totalItems = 1;
        }

        let meta: Meta = {
          totalItems: totalItems,
          itemsPerPage: 20,
          totalPages: 1,
          currentPage: 1,
        };

        if (response?.meta) meta = response.meta;

        return {
          success: true,
          code: context.switchToHttp().getResponse().statusCode,
          message: response?.message,
          timestamp: new Date().toISOString(),
          path: context.switchToHttp().getRequest().url,
          data: data,
          meta: meta,
        };
      }),
    );
  }
}
