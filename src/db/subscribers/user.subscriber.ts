import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
} from 'typeorm';
import { isEmpty, padStart } from 'lodash';
import { User } from '../entities/user.entity';
import { UserRole } from '@/common/enums/user.enum';

@EventSubscriber()
export class UserSubscriber implements EntitySubscriberInterface<User> {
  constructor(dataSource: DataSource) {
    if (dataSource) dataSource.subscribers.push(this);
  }

  listenTo() {
    return User;
  }

  async beforeInsert({ manager, entity }: InsertEvent<User>) {
    const userRepository = manager.getRepository(User);

    const latestUser = await userRepository.find({
      where: { role: entity.role },
      withDeleted: true,
      order: { uid: 'DESC' },
    });

    let prefix = '';
    switch (entity.role) {
      case UserRole.PRIVATE:
        prefix = 'I';
        break;
      case UserRole.DEALER:
        prefix = 'D';
        break;
      case UserRole.AGENT:
        prefix = 'A';
        break;
      case UserRole.VENDOR:
        prefix = 'V';
        break;
    }

    if (!isEmpty(latestUser)) {
      const latestUid = parseInt(latestUser[0].uid?.slice(1));
      const newUid = padStart(String(latestUid + 1), 6, '0');
      entity.uid = `${prefix}${newUid}`;
    } else {
      entity.uid = `${prefix}000001`;
    }
  }
}
