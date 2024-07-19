import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';

import { CarTransmission } from '../entities/car-transmission.entity';

import * as carTransmissions from './data/car-transmissions.json';

export default class CarTransmissionSeeder implements Seeder {
  async run(dataSource: DataSource) {
    const carTransmissionRepository = dataSource.getRepository(CarTransmission);

    for (const carTransmission of carTransmissions) {
      const foundCarTransmission = await carTransmissionRepository.findOne({
        where: {
          name: carTransmission.name,
        },
      });

      if (!foundCarTransmission) {
        const newTransmission = carTransmissionRepository.create({
          ...carTransmission,
        });
        await carTransmissionRepository.save(newTransmission);
      }
    }
  }
}
