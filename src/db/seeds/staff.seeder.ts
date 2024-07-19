import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';

import { Staff } from '../entities/staff.entity';
import * as staffs from './data/staffs.json';
import * as argon from 'argon2';
import { StaffRole, StaffStatus } from '@/common/enums/staff.eum';

export default class StaffSeeder implements Seeder {
  async run(dataSource: DataSource) {
    const staffRepository = dataSource.getRepository(Staff);

    for (const staff of staffs) {
      const foundStaff = await staffRepository.findOne({
        where: { email: staff.email },
      });

      if (!foundStaff) {
        const password = await argon.hash('carsmeup');
        const newStaff = staffRepository.create({
          ...staff,
          password: password,
          role: staff.role as StaffRole,
          status: StaffStatus.VERIFIED,
        });

        await staffRepository.save(newStaff);
      }
    }
  }
}
