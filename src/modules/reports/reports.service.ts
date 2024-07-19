import {
  BadRequestException,
  NotFoundException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Not } from 'typeorm';
import { isEmpty } from 'lodash';
import * as XLSX from 'xlsx-js-style';
import { DateTime } from 'luxon';

import { Report } from '@/db/entities/report.entity';
import { ReportStatus, ReportType } from '@/common/enums/report.enum';

import { QueryReportDto, UpdateReportDto } from './dto';
import { PaginationsService } from '../paginations/paginations.service';
import { ColumnHeader, ColumnRow, ColumnWidth } from './types/xlxs.type';
import { ReportProducer } from './producers/report.producer';
import { Staff } from '@/db/entities/staff.entity';
import { Car } from '@/db/entities/car.entity';

@Injectable()
export class ReportsService {
  constructor(
    private readonly paginationService: PaginationsService,
    private readonly reportProducer: ReportProducer,

    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,

    @InjectRepository(Staff)
    private readonly staffRepository: Repository<Staff>,

    @InjectRepository(Car)
    private readonly carRepository: Repository<Car>,
  ) {}

  async findByStaff(query: QueryReportDto, currentStaffId: number) {
    const {
      search,
      createdAtStart,
      createdAtEnd,
      status,
      reportType,
      sortDirection,
      sortBy,
      limitPerPage,
      page,
      all,
    } = query;

    const staff = await this.staffRepository.findOne({
      where: { id: currentStaffId },
    });
    if (!staff)
      throw new NotFoundException(`Staff ${currentStaffId} not found`);

    const result = this.reportRepository
      .createQueryBuilder('report')
      .leftJoinAndSelect('report.staff', 'staff')
      .where('staff.id = :staffId', { staffId: staff.id });

    if (search) {
      result.andWhere(`(report.name ILIKE :name)`, { name: `%${search}%` });
    }

    if (status) {
      result.andWhere('report.status = :status ', { status });
    }

    if (reportType) {
      result.andWhere('report.reportType = :reportType', { reportType });
    }

    if (createdAtStart && createdAtEnd) {
      result.andWhere(
        'DATE(report.created_at) BETWEEN :createdAtStart AND :createdAtEnd',
        {
          createdAtStart,
          createdAtEnd,
        },
      );
    }

    result.orderBy(`${sortBy}`, sortDirection as 'ASC' | 'DESC');
    return await this.paginationService.paginate(result, {
      limitPerPage,
      page,
      all,
    });
  }

  async findOne(id: number) {
    const report = await this.reportRepository.findOne({
      where: { id: id },
    });

    if (!report) throw new NotFoundException('Report not found');

    return report;
  }

  async update(id: number, dto: UpdateReportDto) {
    const report = await this.reportRepository.preload({ id, ...dto });

    if (!report) throw new BadRequestException('Report not found');

    return await this.reportRepository.save(report);
  }

  async remove(id: number) {
    await this.reportRepository.delete(id);
  }

  async setJobUid(id: number, jobUid: string) {
    const report = await this.reportRepository.findOne({ where: { id: id } });

    if (!report) throw new Error('Report does not exists');

    report.jobUid = jobUid;
    return await this.reportRepository.save(report);
  }

  async moveToDone(id: number) {
    const report = await this.reportRepository.findOne({ where: { id: id } });

    if (!report) throw new Error('Report does not exists');

    report.status = ReportStatus.DONE;
    return await this.reportRepository.save(report);
  }

  async moveToError(id: number, errorMessage: string) {
    const report = await this.reportRepository.findOne({ where: { id: id } });

    if (!report) throw new Error('Report does not exists');

    report.status = ReportStatus.ERROR;
    report.errorMessage = errorMessage;
    this.reportRepository.save(report);
  }

  createReportFile(
    rows: ColumnRow[],
    headers: ColumnHeader[],
    columnWidths?: ColumnWidth[],
    prefix?: string,
  ): Express.Multer.File {
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, prefix);
    XLSX.utils.sheet_add_aoa(worksheet, [headers], { origin: 'A1' });

    if (!isEmpty(columnWidths)) worksheet['!cols'] = columnWidths;

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    const currentDate = DateTime.now().toFormat('yyyy-LL-dd-HH:mm:ss');
    const reportName = `${prefix}-${currentDate}.xlsx`;

    return {
      fieldname: reportName,
      destination: '',
      path: '',
      filename: reportName,
      buffer: buffer,
      encoding: '7bit',
      originalname: reportName,
      mimetype:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      stream: null,
      size: buffer.byteLength,
    };
  }

  async carReport(query: any, currentUserId: number) {
    let startDate = null;
    let endDate = null;
    const staff = await this.staffRepository.findOne({
      where: { id: currentUserId },
    });

    if (!staff) {
      throw new NotFoundException('Staff not found');
    }

    if (query.publishedAtStart) {
      startDate = DateTime.fromJSDate(new Date(query.publishedAtStart))
        .plus({ hours: 7 })
        .toFormat('ddLLLyyyy');
    }

    if (query.publishedAtEnd) {
      endDate = DateTime.fromJSDate(new Date(query.publishedAtEnd))
        .plus({ hours: 7 })
        .toFormat('ddLLLyyyy');
    }

    if (!startDate && !endDate) {
      const firstPublishedCar = await this.carRepository.findOne({
        where: { publishedAt: Not(IsNull()), isCurrentVersion: true },
        order: { publishedAt: 'ASC' },
      });

      const lastPublishedCar = await this.carRepository.findOne({
        where: { publishedAt: Not(IsNull()), isCurrentVersion: true },
        order: { publishedAt: 'DESC' },
      });

      startDate = DateTime.fromJSDate(firstPublishedCar.publishedAt)
        .plus({ hours: 7 })
        .toFormat('ddLLLyyyy');

      endDate = DateTime.fromJSDate(lastPublishedCar.publishedAt)
        .plus({ hours: 7 })
        .toFormat('ddLLLyyyy');
    }

    const reportDate =
      startDate && endDate ? `${startDate}-${endDate}` : `${startDate}`;

    const report = this.reportRepository.create({
      name: `Car-Report-${reportDate}`,
      staff: staff,
      reportType: ReportType.CAR,
    });

    await this.reportRepository.save(report);

    const job = await this.reportProducer.queueUpExportCarReportJob(
      query,
      report.id,
    );

    return {
      id: report.id,
      name: report.name,
      status: report.status,
      progress: job.progress(),
    };
  }
}
