import { Banner } from './../../db/entities/banner.entity';
import { InjectRepository } from '@nestjs/typeorm';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { DataSource, Repository } from 'typeorm';
import { S3FileService } from '@/services';
import { BannerStatus, BannerType } from '@/common/enums/banner.enum';
import { BannerProducer } from './producers/banner.producer';
import { PaginationsService } from '../paginations/paginations.service';
import { QueryBannerDto } from './dto/query-banner.dto';
import { isEmpty } from 'class-validator';
import { QueryRescheduleBanner } from './dto/query-reschedule-banner.dto';
import { QueryPublishedBannerDto } from './dto/query-published-banner.dto';
import { UpdateBannerRunningNoList } from './dto/update-banner-runnung-no-list.dto';
import { Staff } from '@/db/entities/staff.entity';

@Injectable()
export class BannersService {
  constructor(
    private readonly s3FileService: S3FileService,
    private readonly paginationsService: PaginationsService,
    private readonly bannerProducer: BannerProducer,
    private readonly dataSource: DataSource,

    @InjectRepository(Banner)
    private readonly bannerRepository: Repository<Banner>,
    @InjectRepository(Staff)
    private readonly staffRepository: Repository<Staff>,
  ) {}

  async create(
    dto: CreateBannerDto,
    images: {
      desktopImage?: Express.Multer.File[];
      mobileImage?: Express.Multer.File[];
    },
  ) {
    let desktopUrl = '';
    let mobileUrl = '';

    if (images.desktopImage) {
      desktopUrl = await this.uploadBannerImage(images.desktopImage[0]);
    }
    if (images.mobileImage) {
      mobileUrl = await this.uploadBannerImage(images.mobileImage[0]);
    }

    const createBanner = this.bannerRepository.create({
      ...dto,
      desktopUrl,
      mobileUrl,
      scheduleAt: dto.scheduleAt,
    });
    const saveBanner = await this.bannerRepository.save(createBanner);

    if (dto.scheduleAt && dto.status !== BannerStatus.DRAFT) {
      const delayStart: number = Math.max(
        new Date(dto.scheduleAt).getTime() - new Date().getTime(),
        0,
      );
      await this.bannerProducer.queueUpStartBannerJob(
        saveBanner.id,
        delayStart,
      );
    }
    return saveBanner;
  }

  async setStartSchedulerBanner(id: number) {
    const banner = await this.bannerRepository.findOne({ where: { id } });
    const totalBanners = await this.bannerRepository.findAndCount({
      where: {
        bannerType: banner.bannerType,
        status: BannerStatus.PUBLISHED,
      },
    });
    banner.status = BannerStatus.PUBLISHED;
    banner.runningNo = totalBanners[1] + 1;
    return await this.bannerRepository.save(banner);
  }

  async findAll(dto: QueryBannerDto) {
    const {
      limitPerPage,
      page,
      all,
      sortDirection,
      sortBy,
      status,
      bannerType,
    } = dto;

    const bannerQuery = this.bannerRepository
      .createQueryBuilder('banner')
      .where('banner.bannerType = :bannerType', { bannerType });

    if (!isEmpty(status)) {
      bannerQuery.andWhere(`banner.status IN (:...status)`, { status });
    }
    bannerQuery.orderBy(`${sortBy}`, sortDirection as 'ASC' | 'DESC');
    return await this.paginationsService.paginate(bannerQuery, {
      limitPerPage,
      all,
      page,
    });
  }

  async findOne(id: number) {
    const banner = await this.bannerRepository.findOne({ where: { id } });
    if (!banner) {
      throw new NotFoundException(`Banner id#${id} not found`);
    }
    return banner;
  }

  async update(
    id: number,
    dto: UpdateBannerDto,
    images: {
      desktopImage?: Express.Multer.File[];
      mobileImage?: Express.Multer.File[];
    },
  ) {
    const { name, clientName, url, scheduleAt } = dto;
    const banner = await this.bannerRepository.preload({
      id,
      scheduleAt,
      clientName,
      url,
      name,
    });
    if (!banner) {
      throw new NotFoundException(`Banner id#${id} not found`);
    }
    if (images?.desktopImage) {
      await this.removeBannerImage(banner.desktopUrl);
      banner.desktopUrl = await this.uploadBannerImage(images.desktopImage[0]);
    }
    if (images?.mobileImage) {
      await this.removeBannerImage(banner.mobileUrl);
      banner.mobileUrl = await this.uploadBannerImage(images.mobileImage[0]);
    }

    if (scheduleAt && banner.status === BannerStatus.SCHEDULED) {
      const delayStart: number = Math.max(
        new Date(dto.scheduleAt).getTime() - new Date().getTime(),
        0,
      );
      await this.bannerProducer.removeScheduledBannerJob(id);
      await this.bannerProducer.queueUpStartBannerJob(id, delayStart);
    }
    return await this.bannerRepository.save(banner);
  }

  async uploadBannerImage(image: Express.Multer.File) {
    const uploadedFile = await this.s3FileService.fileUpload(
      image,
      'images/banner',
    );

    if (!uploadedFile.location) {
      throw new BadRequestException(`Upload file process not success`);
    }
    return uploadedFile.location;
  }

  async removeBannerImage(bannerImageUrl: string) {
    const filename = bannerImageUrl.split('/').pop();
    await this.s3FileService.removeFile(filename, 'banner');
  }

  async remove(id: number) {
    const banner = await this.bannerRepository.findOne({ where: { id } });
    if (!banner) {
      throw new NotFoundException(`Banner id#${id} not found`);
    }

    await this.removeBannerImage(banner.desktopUrl);
    await this.removeBannerImage(banner.mobileUrl);

    if (banner.status == BannerStatus.SCHEDULED) {
      await this.bannerProducer.removeScheduledBannerJob(id);
    }
    await this.bannerRepository.remove(banner);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await this.bannerRepository
        .createQueryBuilder()
        .update(Banner)
        .set({ runningNo: () => 'running_no - 1' })
        .where('running_no > :running_no and banner_type = :bannerType', {
          bannerType: banner.bannerType,
          running_no: banner.runningNo,
        })
        .execute();
      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
    return { message: 'Success' };
  }

  async draft(id: number) {
    const banner = await this.bannerRepository.findOne({ where: { id } });
    if (!banner) {
      throw new NotFoundException(`Banner id#${id} not found`);
    }

    if (banner.status === BannerStatus.PUBLISHED) {
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();
      try {
        await this.bannerRepository
          .createQueryBuilder()
          .update(Banner)
          .set({ runningNo: () => 'running_no - 1' })
          .where('running_no > :running_no and banner_type = :bannerType', {
            bannerType: banner.bannerType,
            running_no: banner.runningNo,
          })
          .execute();
        banner.status = BannerStatus.DRAFT;
        banner.runningNo = null;
        await this.bannerRepository.save(banner);

        await queryRunner.commitTransaction();
      } catch (err) {
        await queryRunner.rollbackTransaction();
      } finally {
        await queryRunner.release();
      }
    }
    if (banner.status === BannerStatus.SCHEDULED) {
      await this.bannerProducer.removeScheduledBannerJob(id);
      banner.status = BannerStatus.DRAFT;
      banner.runningNo = null;
      await this.bannerRepository.save(banner);
    }
    return await this.bannerRepository.findOne({ where: { id } });
  }

  async reschedule(id: number, dto: QueryRescheduleBanner) {
    const banner = await this.bannerRepository.findOne({ where: { id } });
    if (!banner) {
      throw new NotFoundException(`Banner id#${id} not found`);
    }
    if (banner.status == BannerStatus.SCHEDULED) {
      await this.bannerProducer.removeScheduledBannerJob(id);
    }
    if (dto?.scheduleAt) {
      const delayStart: number = Math.max(
        new Date(dto?.scheduleAt).getTime() - new Date().getTime(),
        0,
      );
      await this.bannerProducer.queueUpStartBannerJob(id, delayStart);
    }
    banner.status = BannerStatus.SCHEDULED;
    banner.scheduleAt = dto.scheduleAt;
    return await this.bannerRepository.save(banner);
  }

  async publish(id: number) {
    const banner = await this.bannerRepository.findOne({ where: { id } });
    if (!banner) {
      throw new NotFoundException(`Banner id#${id} not found`);
    }
    if (banner.status == BannerStatus.SCHEDULED) {
      await this.bannerProducer.removeScheduledBannerJob(id);
    }
    return await this.setStartSchedulerBanner(banner.id);
  }

  async unpublish(id: number) {
    const banner = await this.bannerRepository.findOne({
      where: { id, status: BannerStatus.PUBLISHED },
    });
    if (!banner) {
      throw new NotFoundException(
        `Banner id#${id} not found or banner is not published.`,
      );
    }
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const bannerRepository = queryRunner.manager.getRepository(Banner);
      await bannerRepository
        .createQueryBuilder()
        .update(Banner)
        .set({ runningNo: () => 'running_no - 1' })
        .where('running_no > :running_no and banner_type = :bannerType', {
          bannerType: banner.bannerType,
          running_no: banner.runningNo,
        })
        .execute();
      banner.status = BannerStatus.UNPUBLISHED;
      banner.runningNo = null;
      await bannerRepository.save(banner);

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }

    return await this.bannerRepository.findOne({ where: { id } });
  }

  async findPublishedBanners(dto: QueryPublishedBannerDto) {
    const bannerQuery = this.bannerRepository
      .createQueryBuilder('banner')
      .where('banner.status = :status', { status: BannerStatus.PUBLISHED });

    if (dto.bannerType === BannerType.HERO_ADVERTISING) {
      bannerQuery
        .andWhere('banner.bannerType = :type', {
          type: BannerType.HERO_ADVERTISING,
        })
        .limit(1);
    }
    if (dto.bannerType === BannerType.HERO_BANNER) {
      bannerQuery.andWhere('banner.bannerType = :type', {
        type: BannerType.HERO_BANNER,
      });
    }
    if (dto.bannerType === BannerType.SUB_ADVERTISING) {
      bannerQuery
        .andWhere('banner.bannerType = :type', {
          type: BannerType.SUB_ADVERTISING,
        })
        .limit(3);
    }
    bannerQuery.orderBy('banner.runningNo', 'ASC');
    return await bannerQuery.getMany();
  }

  async updateRunningNoList(
    dto: UpdateBannerRunningNoList,
    currentStaffId: number,
  ) {
    const staff = await this.staffRepository.findOne({
      where: { id: currentStaffId },
    });

    if (!staff) {
      throw new NotFoundException(`Staff ${currentStaffId} not found`);
    }

    const banners = [];
    for (const banner of dto.banners) {
      const findBanner = await this.bannerRepository.findOne({
        where: { id: banner.id },
      });
      if (!findBanner) {
        throw new NotFoundException(`Banner id#${banner.id} not found`);
      }
      findBanner.runningNo = banner.runningNo;
      banners.push(findBanner);
    }
    return await this.bannerRepository.save(banners);
  }
}
