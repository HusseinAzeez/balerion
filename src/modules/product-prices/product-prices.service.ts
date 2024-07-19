import { UserRole } from '@/common/enums/user.enum';
import { ProductPrice } from '@/db/entities/product-price.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QueryProductPriceDto } from './dto/product-price.dto';

@Injectable()
export class ProductPricesService {
  constructor(
    @InjectRepository(ProductPrice)
    private readonly productPriceRepository: Repository<ProductPrice>,
  ) {}

  async findOne(id: number) {
    const productPrice = await this.productPriceRepository.findOne({
      where: { id },
    });

    if (!productPrice) {
      throw new NotFoundException(`servicePrice ${id} not found`);
    }

    return productPrice;
  }

  async findByRoleAndProductType(dto: QueryProductPriceDto) {
    const { role, productType } = dto;
    const quantity = 1;
    let servicePrices = [];

    if (role === UserRole.DEALER) {
      servicePrices = await this.productPriceRepository.find({
        where: { productType },
      });
    } else {
      servicePrices = await this.productPriceRepository.find({
        where: { productType, quantity },
      });
    }
    return servicePrices;
  }
}
