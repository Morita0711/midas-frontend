import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'parseAccount',
})
export class ParseAccountPipe implements PipeTransform {
  transform(value: string): any {
    const data =
      value.charAt(0) +
      '' +
      value.charAt(1) +
      '' +
      value.charAt(2) +
      '' +
      value.charAt(4) +
      value.charAt(5) +
      '' +
      value.charAt(6) +
      '' +
      '...' +
      value.charAt(value.length - 4) +
      '' +
      value.charAt(value.length - 3) +
      '' +
      value.charAt(value.length - 2) +
      '' +
      value.charAt(value.length - 1);
    return data;
  }
}
