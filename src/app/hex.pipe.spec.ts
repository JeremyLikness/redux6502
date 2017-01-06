/* tslint:disable:no-unused-variable */

import { TestBed, async } from '@angular/core/testing';
import { HexPipe } from './hex.pipe';

describe('HexPipe', () => {

  let pipe: HexPipe;

  beforeEach(() => {
    pipe = new HexPipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('converts to a word by default', () => {
    expect(pipe.transform(255)).toBe('$00FF');
  });

  it('converts to number of digits passed', () => {
    expect(pipe.transform(255, 2)).toBe('$FF');
  });
});
