import { District } from './district';

export class Commune {
  id!: number;
  name!: string;
  code!: string;
  description!: string;
  districtId!: number;
  district!: District;
  englishName!: string;
  khmerName!: string;
}
