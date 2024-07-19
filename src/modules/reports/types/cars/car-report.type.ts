import { ColumnHeader, ColumnWidth } from '../xlxs.type';

export type CarExportRow = {
  publishedAtDate: string;
  publishedAtTime: string;
  brand: string;
  model: string;
  submodel: string;
  color: string;
  mileage: number;
  manufacturingYear: number;
  userType: string;
  dealerName: string;
  userName: string;
  userId: string;
  phoneNumber: string;
  lineId: string;
  carType: string;
  carLocation: string;
  price: number;
  lowPrice: number;
  mediumPrice: number;
  highPrice: number;
  postOnScoialMedia: string;
  clicks: number;
  views: number;
  impressions: number;
  transmission: string;
  bodyType: string;
  fuelType: string;
  isHotDealed: string;
  isCarsmeupCertified: string;
  carStatus: string;
};

export const headerStyle = {
  t: 's',
  s: {
    alignment: { horizontal: 'left', wrapText: true },
    font: { bold: true, sz: 14 },
    border: {
      top: { style: 'thin' },
      bottom: { style: 'thin' },
      left: { style: 'thin' },
      right: { style: 'thin' },
    },
  },
};

export const carExportWidths: ColumnWidth[] = [
  { wch: 20 },
  { wch: 20 },
  { wch: 20 },
  { wch: 30 },
  { wch: 50 },
  { wch: 10 },
  { wch: 20 },
  { wch: 10 },
  { wch: 10 },
  { wch: 30 },
  { wch: 30 },
  { wch: 20 },
  { wch: 20 },
  { wch: 30 },
  { wch: 20 },
  { wch: 30 },
  { wch: 40 },
  { wch: 20 },
  { wch: 20 },
  { wch: 20 },
  { wch: 50 },
  { wch: 20 },
  { wch: 20 },
  { wch: 20 },
  { wch: 20 },
  { wch: 20 },
  { wch: 20 },
  { wch: 50 },
  { wch: 50 },
  { wch: 50 },
];

export const carExportHeaders: ColumnHeader[] = [
  { v: 'Date of posting', ...headerStyle },
  { v: 'Time of posting', ...headerStyle },
  { v: 'Brand', ...headerStyle },
  { v: 'Model', ...headerStyle },
  { v: 'Submodel', ...headerStyle },
  { v: 'Color', ...headerStyle },
  { v: 'Mileage', ...headerStyle },
  { v: 'Manufacturing year', ...headerStyle },
  { v: 'User type', ...headerStyle },
  { v: 'Dealer name', ...headerStyle },
  { v: 'User name', ...headerStyle },
  { v: 'User id', ...headerStyle },
  { v: 'Phone number', ...headerStyle },
  { v: 'Line id', ...headerStyle },
  { v: 'Type of car', ...headerStyle },
  { v: "Car's location", ...headerStyle },
  { v: 'Selling price (after discount)', ...headerStyle },
  { v: 'Low price', ...headerStyle },
  { v: 'Medium price', ...headerStyle },
  { v: 'High price', ...headerStyle },
  { v: 'Click need to sell fast / Social media on', ...headerStyle },
  { v: 'Clicks', ...headerStyle },
  { v: 'Views', ...headerStyle },
  { v: 'Impressions', ...headerStyle },
  { v: 'Transmission', ...headerStyle },
  { v: 'Body type', ...headerStyle },
  { v: 'Fuel type', ...headerStyle },
  { v: 'If it is active as hot deal', ...headerStyle },
  { v: 'If it was CarsmeUp inspected', ...headerStyle },
  { v: 'Car status (as of now)', ...headerStyle },
];
