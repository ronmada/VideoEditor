import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'roundTwoDecimals',
  standalone: true,
})
export class RoundTwoDecimalsPipe implements PipeTransform {
  transform(value: number) {
    return Math.round(value * 100 + Number.EPSILON) / 100;
  }
}
