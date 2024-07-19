import { Controller, Get, Param, Delete, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { Report } from '@/db/entities/report.entity';

import { ReportsService } from './reports.service';
import { QueryReportDto, QueryExportCarReportDto } from './dto';
import { GetCurrentUserId } from '@/common/decorators';

@ApiTags('Reports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('export/car-report')
  @ApiBearerAuth()
  carReport(
    @Query() query: QueryExportCarReportDto,
    @GetCurrentUserId() currentUserId: number,
  ) {
    return this.reportsService.carReport(query, currentUserId);
  }

  @Get('')
  @ApiBearerAuth()
  @ApiOkResponse({ type: Report, isArray: true })
  findByStaff(
    @Query() query: QueryReportDto,
    @GetCurrentUserId() currentStaffId: number,
  ) {
    return this.reportsService.findByStaff(query, currentStaffId);
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOkResponse({ type: Report })
  findOne(@Param('id') id: string) {
    return this.reportsService.findOne(+id);
  }

  @Delete(':id')
  @ApiBearerAuth()
  remove(@Param('id') id: string) {
    return this.reportsService.remove(+id);
  }
}
