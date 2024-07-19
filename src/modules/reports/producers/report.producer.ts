import { Injectable } from '@nestjs/common';
import { Queue, Job } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { QueryExportCarReportDto } from '../dto';

@Injectable()
export class ReportProducer {
  constructor(@InjectQueue('report') private reportQueue: Queue) {}

  async queueUpExportCarReportJob(
    query: QueryExportCarReportDto,
    reportId: number,
  ): Promise<Job<any>> {
    return await this.reportQueue.add('car-report', {
      query: query,
      reportId: reportId,
    });
  }
}
