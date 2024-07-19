import { Meta } from './meta.interface';

export interface GlobalResponse<T> {
  success: boolean;
  code: number;
  message: string;
  timestamp: string;
  path: string;
  data: Array<Record<string, any>> | Record<string, any>;
  meta: Meta;
}
