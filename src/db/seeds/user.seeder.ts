import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';

import { User } from '../entities/user.entity';
import { UserRole, UserStatus } from '@/common/enums/user.enum';
import * as users from './data/users.json';
import * as argon from 'argon2';

export default class UserSeeder implements Seeder {
  async run(dataSource: DataSource) {
    const userRepository = dataSource.getRepository(User);

    for (const user of users) {
      const foundUser = await userRepository.findOne({
        where: { email: user.email },
      });

      if (!foundUser) {
        const password = await argon.hash('carsmeup');

        const newUser = userRepository.create({
          ...user,
          password: password,
          role: user.role as UserRole,
          status: UserStatus.VERIFIED,
        });

        await userRepository.save(newUser);
      }
    }
  }
}
