import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';

import { CarFuelType } from '../entities/car-fuel-type.entity';

import * as carFuelTypes from './data/car-fuel-types.json';

export default class CarFuelTypeSeeder implements Seeder {
  async run(dataSource: DataSource) {
    const carFuelTypeRepository = dataSource.getRepository(CarFuelType);

    for (const carFuelType of carFuelTypes) {
      const foundCarFuelType = await carFuelTypeRepository.findOne({
        where: {
          name: carFuelType.name,
        },
      });

      if (!foundCarFuelType) {
        const newCarFuelType = carFuelTypeRepository.create({
          ...carFuelType,
        });
        await carFuelTypeRepository.save(newCarFuelType);
      }
    }
  }
}
