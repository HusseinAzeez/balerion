import { Public } from '@/common/decorators';
import { AnalyticsClick } from '@/db/entities/analytics-click.entity';
import { AnalyticsImpression } from '@/db/entities/analytics-impression.entity';
import { AnalyticsView } from '@/db/entities/analytics-view.entity';
import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import {
  CarCategorizeSchema,
  CarLineChartSchema,
  CarTopModelSchema,
  UserCountPerRoleResponseSchema,
} from './analytics.constant';
import { AnalyticsService } from './analytics.service';
import { CreateAnalyticsClickDto } from './dto/create-analytics-click.dto';
import { CreateAnalyticsImpressionDto } from './dto/create-analytics-impression.dto';
import { CreateAnalyticsViewDto } from './dto/create-analytics-view.dto';
import { QueryUserCountPerRoleDto } from './dto/query-user-count-per-role.dto';
import { QueryCarCategorizeDto } from './dto/query-car-categorize.dto';
import { QueryCarTopModelDto } from './dto/query-car-top-model.dto';
import { QueryLineChartDto } from './dto/query-line-chart.dto';

@ApiTags('Analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Public()
  @Post('views')
  @ApiCreatedResponse({ type: AnalyticsView })
  @ApiNotFoundResponse({ description: 'Car not found' })
  createViews(@Body() dto: CreateAnalyticsViewDto) {
    return this.analyticsService.createViews(dto);
  }

  @Public()
  @Post('clicks')
  @ApiCreatedResponse({ type: AnalyticsClick })
  @ApiNotFoundResponse({ description: 'Car not found' })
  createClicks(@Body() dto: CreateAnalyticsClickDto) {
    return this.analyticsService.createClicks(dto);
  }

  @Public()
  @Post('impressions')
  @ApiCreatedResponse({ type: AnalyticsImpression })
  @ApiNotFoundResponse({ description: 'Car not found' })
  createImpressions(@Body() dto: CreateAnalyticsImpressionDto) {
    return this.analyticsService.createImpressions(dto);
  }

  @Get('users/count-per-role')
  @ApiBearerAuth()
  @ApiOkResponse(UserCountPerRoleResponseSchema)
  userCountPerRole(@Query() query: QueryUserCountPerRoleDto) {
    return this.analyticsService.userCountPerRole(query);
  }

  @Get('cars/categorize')
  @ApiBearerAuth()
  @ApiOkResponse(CarCategorizeSchema)
  findCarCategorize(@Query() query: QueryCarCategorizeDto) {
    return this.analyticsService.findCarCategorize(query);
  }

  @Get('cars/top-model')
  @ApiBearerAuth()
  @ApiOkResponse(CarTopModelSchema)
  findCarTopModel(@Query() query: QueryCarTopModelDto) {
    return this.analyticsService.findCarTopModel(query);
  }

  @Get('cars/line-chart')
  @ApiBearerAuth()
  @ApiOkResponse(CarLineChartSchema)
  findCarLineChart(@Query() query: QueryLineChartDto) {
    return this.analyticsService.findCarLineChart(query);
  }
}
