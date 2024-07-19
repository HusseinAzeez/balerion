import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
} from 'typeorm';
import { isEmpty, padStart } from 'lodash';
import { Voucher } from '../entities/voucher.entity';
import { VoucherType } from '@/common/enums/voucher.enum';

@EventSubscriber()
export class VoucherSubscriber implements EntitySubscriberInterface<Voucher> {
  constructor(dataSource: DataSource) {
    if (dataSource) dataSource.subscribers.push(this);
  }

  listenTo() {
    return Voucher;
  }

  async beforeInsert({ manager, entity }: InsertEvent<Voucher>) {
    const voucherRepository = manager.getRepository(Voucher);

    const latestVoucher = await voucherRepository.find({
      where: { voucherType: entity.voucherType },
      withDeleted: true,
      order: { uid: 'DESC' },
    });

    let prefix = '';
    switch (entity.voucherType) {
      case VoucherType.CARSMEUP_CERTIFIED:
        prefix = 'CMC';
        break;
      case VoucherType.ROADSIDE_ASSIST:
        prefix = 'RSA';
        break;
      case VoucherType.B_QUIK_BENZINE:
        prefix = 'BQB';

        break;
      case VoucherType.B_QUIK_DIESEL:
        prefix = 'BQD';
        break;
    }

    if (!isEmpty(latestVoucher)) {
      const latestUid = parseInt(latestVoucher[0].uid?.slice(3));
      const newUid = padStart(String(latestUid + 1), 7, '0');
      entity.uid = `${prefix}${newUid}`;
    } else {
      entity.uid = `${prefix}0000001`;
    }
  }
}
