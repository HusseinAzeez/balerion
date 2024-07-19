import { ValueTransformer } from 'typeorm';
import * as _ from 'lodash';

export class ColumnNumericTransformer implements ValueTransformer {
  to(data?: number | null): number | null {
    if (!_.isNull(data) || !_.isUndefined(data)) {
      return data;
    }
    return null;
  }

  from(data?: string | null): number | null {
    if (!_.isNull(data) || !_.isUndefined(data)) {
      const res = parseFloat(data);
      if (isNaN(res)) {
        return null;
      } else {
        return res;
      }
    }
    return null;
  }
}
