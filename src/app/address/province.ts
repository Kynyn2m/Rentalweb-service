import { Country } from './country';

export class Province {
  id!: number;
  name!: string;
  code!: string;
  description!: string;
  countryId!: number;
  country!: Country;
  englishName!: string;
  khmerName!: string;
}
