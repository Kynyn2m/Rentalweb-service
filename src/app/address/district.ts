import { Province } from './province';

export class District {
  id!: number;
  name!: string;
  code!: string;
  description!: string;
  provinceId!: number;
  province!: Province;
  englishName!: string;
  khmerName!: string;
}
