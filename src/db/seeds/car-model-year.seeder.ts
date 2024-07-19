import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';

import { CarYear } from '../entities/car-year.entity';

import * as carYears from './data/car-years.json';

export default class CarModelYearSeeder implements Seeder {
  async run(dataSource: DataSource) {
    const carYearRepository = dataSource.getRepository(CarYear);

    for (const carYear of carYears) {
      const foundyear = await carYearRepository.findOne({
        where: {
          name: carYear.name,
        },
      });

      if (!foundyear) {
        const newCarYear = carYearRepository.create({
          ...carYear,
        });
        await carYearRepository.save(newCarYear);
      }
    }
  }
}
