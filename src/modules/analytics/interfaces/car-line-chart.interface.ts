import {
  AnalyticsCarChartType,
  LineChartReportType,
} from '@/common/enums/analytics.enum';
import { UserRole } from '@/common/enums/user.enum';

export interface IFindLineChartData {
  startDate?: Date;
  endDate?: Date;
  brandName?: string;
  modelName?: string;
  manufacturedYear?: string;
  subModelName?: string;
  isCarsmeupCertified?: boolean;
  isHotDealed?: boolean;
  province?: string;
  district?: string;
  userTypes?: UserRole[];
}

export interface IFindLineChartDataFromAnalytic extends IFindLineChartData {
  reportType: LineChartReportType;
}

export interface IAnalyticCarLineChartData {
  value: number;
  date: Date;
}

export interface IAnalyticCarLineChart {
  chartType: AnalyticsCarChartType;
  chartData: IAnalyticCarLineChartData[];
}
