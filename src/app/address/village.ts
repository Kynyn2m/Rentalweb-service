import { Commune } from './commune';

export class Village {
  id!: number;
  name!: string;
  code!: string;
  description!: string;
  communeId!: number;
  commune!: Commune;
  englishName!: string;
  khmerName!: string;
}
