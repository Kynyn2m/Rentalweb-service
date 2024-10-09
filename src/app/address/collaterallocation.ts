export class CollateralFilter {
  page!: number;
  size!: number;
  provinceId!: number;
  districtId!: number;
  communeId!: number;
  villegeId!: number;
  layoutTypeId!: string;
  from!: Date | null;
  to!: Date | null;

  toQueryString(): string {
    return ''
      .concat(`from=${this.from?.toISOString() ?? ''}`)
      .concat(`&to=${this.to?.toISOString() ?? ''}`)
      .concat(`&provinceId=${this.provinceId}`)
      .concat(`&districtId=${this.districtId}`)
      .concat(`&communeId=${this.communeId}`)
      .concat(`&villegeId=${this.villegeId}`)
      .concat(`&layoutTypeId=${this.layoutTypeId}`)
      .concat(`&page=${this.page}`)
      .concat(`&size=${this.size}`);
  }
}
