import { CarExportRow } from './cars/car-report.type';

export type ColumnRow = CarExportRow;

export type ColumnHeader = {
  t: string;
  s: Record<string, any>;
  v: string;
};

export type ColumnWidth = {
  wch: number;
};
