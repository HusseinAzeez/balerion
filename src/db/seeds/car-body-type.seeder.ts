import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';

import { CarBodyType } from '../entities/car-body-type.entity';

import * as carBodyTypes from './data/car-body-types.json';

export default class CarBodyTypeSeeder implements Seeder {
  async run(dataSource: DataSource) {
    const carBodyTypeRepository = dataSource.getRepository(CarBodyType);

    for (const carBodyType of carBodyTypes) {
      const foundCarBodyType = await carBodyTypeRepository.findOne({
        where: {
          name: carBodyType.name,
        },
      });

      if (!foundCarBodyType) {
        const newCarBodyType = carBodyTypeRepository.create({
          ...carBodyType,
        });
        await carBodyTypeRepository.save(newCarBodyType);
      }
    }
  }
}
