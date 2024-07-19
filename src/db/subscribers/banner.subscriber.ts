import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
} from 'typeorm';
import { isEmpty, padStart } from 'lodash';
import { Voucher } from '../entities/voucher.entity';
import { Banner } from '../entities/banner.entity';
import { BannerType } from '@/common/enums/banner.enum';

@EventSubscriber()
export class BannerSubscriber implements EntitySubscriberInterface<Banner> {
  constructor(dataSource: DataSource) {
    if (dataSource) dataSource.subscribers.push(this);
  }

  listenTo() {
    return Banner;
  }

  async beforeInsert({ manager, entity }: InsertEvent<Banner>) {
    const bannerRepository = manager.getRepository(Banner);

    const latestBanner = await bannerRepository.find({
      where: { bannerType: entity.bannerType },
      withDeleted: true,
      order: { uid: 'DESC' },
    });
    let prefix = '';
    switch (entity.bannerType) {
      case BannerType.HERO_ADVERTISING:
        prefix = 'HEA';
        break;
      case BannerType.HERO_BANNER:
        prefix = 'HEB';
        break;
      case BannerType.SUB_ADVERTISING:
        prefix = 'SUA';
        break;
    }

    if (!isEmpty(latestBanner)) {
      const latestUid = parseInt(latestBanner[0].uid?.slice(3));
      const newUid = padStart(String(latestUid + 1), 5, '0');
      entity.uid = `${prefix}${newUid}`;
    } else {
      entity.uid = `${prefix}00001`;
    }
  }
}
