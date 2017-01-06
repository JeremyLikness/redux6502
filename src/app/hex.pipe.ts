import { Pipe, PipeTransform } from '@angular/core';

import { hexHelper } from './cpu/globals';

@Pipe({
  name: 'hex'
})
export class HexPipe implements PipeTransform {

  transform(value: any, size = 4): any {
    return `$${hexHelper(Number(value), size)}`;
  }

}
