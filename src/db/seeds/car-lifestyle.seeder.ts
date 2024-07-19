import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';

import { CarLifestyle } from '../entities/car-lifestyle.entity';

import * as carLifestyles from './data/car-lifestyles.json';

export default class CarLifestyleSeeder implements Seeder {
  async run(dataSource: DataSource) {
    const carLifestyleRepository = dataSource.getRepository(CarLifestyle);

    for (const carLifestyle of carLifestyles) {
      const foundCarLifestyle = await carLifestyleRepository.findOne({
        where: {
          name: carLifestyle.name,
        },
      });

      if (!foundCarLifestyle) {
        const newCarLifestyle = carLifestyleRepository.create({
          ...carLifestyle,
        });
        await carLifestyleRepository.save(newCarLifestyle);
      }
    }
  }
}
