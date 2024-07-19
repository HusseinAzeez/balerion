import { UserRole } from '@/common/enums/user.enum';
import { ServicePrice } from '@/db/entities/service-price.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QueryServicePriceDto } from './dto/query-service-prices.dto';

@Injectable()
export class ServicePricesService {
  constructor(
    @InjectRepository(ServicePrice)
    private readonly serviceRepository: Repository<ServicePrice>,
  ) {}

  async findOne(id: number) {
    const servicePrice = await this.serviceRepository.findOne({
      where: { id },
    });

    if (!servicePrice) {
      throw new NotFoundException(`servicePrice ${id} not found`);
    }

    return servicePrice;
  }

  async findByRoleAndServiceType(dto: QueryServicePriceDto) {
    const { role, serviceType } = dto;
    const quantity = 1;
    let servicePrices = [];

    if (role === UserRole.DEALER) {
      servicePrices = await this.serviceRepository.find({
        where: { serviceType },
      });
    } else {
      servicePrices = await this.serviceRepository.find({
        where: { serviceType, quantity },
      });
    }
    return servicePrices;
  }
}
