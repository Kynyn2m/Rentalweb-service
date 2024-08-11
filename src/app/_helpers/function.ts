import * as _moment from 'moment';
import { default as _rollupMoment } from 'moment';

const moment = _rollupMoment || _moment;

export function FormatDate(date: Date | string) {
  const _date = moment(date).format("YYYY-MM-DD");
  return _date
}
