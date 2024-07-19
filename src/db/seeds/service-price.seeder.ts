import { ServicePriceType } from '@/common/enums/service-price.enum';
import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { ServicePrice } from '../entities/service-price.entity';
import * as servicePrices from './data/service-prices.json';

export default class ServicePriceSeeder implements Seeder {
  async run(dataSource: DataSource) {
    const servicePriceRepository = dataSource.getRepository(ServicePrice);

    for (const service of servicePrices) {
      const foundService = await servicePriceRepository.findOne({
        where: {
          price: service.price,
          quantity: service.quantity,
          serviceType: service.serviceType as ServicePriceType,
        },
      });
      if (!foundService) {
        const newServicePrice = servicePriceRepository.create({
          ...service,
          serviceType: service.serviceType as ServicePriceType,
        });
        await servicePriceRepository.save(newServicePrice);
      }
    }
  }
}
