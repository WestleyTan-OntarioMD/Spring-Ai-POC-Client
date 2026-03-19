import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'size',
})
export class SizePipe implements PipeTransform {
  private FACTOR = 1024;
  transform(value: number | undefined | null): string {
    if (!value || value < this.FACTOR) return '0KB';

    const kb = value / this.FACTOR;
    if (kb <= 1024) return `${Math.floor(kb)}KB`;

    const mb = kb / this.FACTOR;
    if (kb <= 1024) return `${Math.floor(mb)}MB`;

    const gb = mb / this.FACTOR;
    return `${Math.floor(gb)}GB`;
  }
}
