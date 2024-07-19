import { SelectQueryBuilder } from 'typeorm';
import { Injectable } from '@nestjs/common';

import { PaginateDto } from './dto/paginate.dto';

@Injectable()
export class PaginationsService {
  async paginate<T>(
    query: SelectQueryBuilder<T>,
    paginatedInput: PaginateDto,
    meta?: any,
  ): Promise<any> {
    if (!query) {
      return {
        data: [],
        meta: {
          totalItems: 0,
          itemsPerPage: paginatedInput.limitPerPage,
          currentPage: paginatedInput.page,
          totalPages: 0,
        },
      };
    }

    if (!paginatedInput.all) {
      const skip = (paginatedInput.page - 1) * paginatedInput.limitPerPage;
      query.take(paginatedInput.limitPerPage);
      query.skip(skip);
    }

    const [result, totalItems] = await query.getManyAndCount();
    const totalPages = Math.ceil(totalItems / paginatedInput.limitPerPage);

    const metadata = paginatedInput.all
      ? {
          totalItems: totalItems,
          ...meta,
        }
      : {
          totalItems: totalItems,
          itemsPerPage: paginatedInput.limitPerPage,
          totalPages: totalPages,
          currentPage: paginatedInput.page,
          ...meta,
        };

    return {
      data: result,
      meta: metadata,
    };
  }
}
