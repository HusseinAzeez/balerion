import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { CarEquipment } from '../entities/car-equipment.entity';

import * as carLifestyles from './data/car-equipments.json';

export default class CarEquipmentSeeder implements Seeder {
  async run(dataSource: DataSource) {
    const carEquipmentRepository = dataSource.getRepository(CarEquipment);

    for (const carEquipment of carLifestyles) {
      const foundCarEquipment = await carEquipmentRepository.findOne({
        where: {
          name: carEquipment.name,
        },
      });

      if (!foundCarEquipment) {
        const newCarEquipment = carEquipmentRepository.create({
          ...carEquipment,
        });
        await carEquipmentRepository.save(newCarEquipment);
      }
    }
  }
}
