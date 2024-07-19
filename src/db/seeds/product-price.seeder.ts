import { ProductPriceType } from '@/common/enums/product-price.enum';
import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { ProductPrice } from '../entities/product-price.entity';
import * as productPrices from './data/product-prices.json';

export default class ProductPriceSeeder implements Seeder {
  async run(dataSource: DataSource) {
    const productPriceRepository = dataSource.getRepository(ProductPrice);

    for (const product of productPrices) {
      const foundProduct = await productPriceRepository.findOne({
        where: {
          price: product.price,
          quantity: product.quantity,
          productType: product.productType as ProductPriceType,
        },
      });
      if (!foundProduct) {
        const newProductPrice = productPriceRepository.create({
          ...product,
          productType: product.productType as ProductPriceType,
        });
        await productPriceRepository.save(newProductPrice);
      }
    }
  }
}
