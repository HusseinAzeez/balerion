import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';

import { CarEngine } from '../entities/car-engine.entity';

import * as carEngines from './data/car-engines.json';

export default class CarEngineSeeder implements Seeder {
  async run(dataSource: DataSource) {
    const carEngineRepository = dataSource.getRepository(CarEngine);

    for (const carEngine of carEngines) {
      const foundCarEngine = await carEngineRepository.findOne({
        where: {
          name: carEngine.name,
        },
      });

      if (!foundCarEngine) {
        const newCarEngine = carEngineRepository.create({
          ...carEngine,
        });
        await carEngineRepository.save(newCarEngine);
      }
    }
  }
}
