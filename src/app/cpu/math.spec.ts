import { addWithCarry, subtractWithCarry, Flag } from './globals';
import { Flags } from './constants';

import { TestBed } from '@angular/core/testing';

describe('math', () => {

    let flag: Flag = 0x0;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ addWithCarry, subtractWithCarry ]
        });
    });

    describe('add with carry', () => {

        describe('decimal mode not set', () => {

            describe('carry flag set' , () => {

                beforeEach(() => {
                    flag = Flags.CarryFlagSet;
                });

                it('should add the numbers and reset the carry flag', () => {
                    let result = addWithCarry(flag, 0x01, 0x02); // 1 + 2 (+ carry flag) = 4
                    expect(result.flag & Flags.CarryFlag).toBeFalsy();
                    expect(result.result).toBe(0x04);
                });

                it('should add the numbers and keep the carry flag set when the new math overflows', () => {
                    let result = addWithCarry(flag, 0xFE, 0x01); // 254 + 1 (+ carry flag) = 256
                    expect(result.flag & Flags.CarryFlag).toBeTruthy();
                    expect(result.result).toBe(0x00);
                });

            });

            describe('carry flag not set', () => {

                beforeEach(() => {
                    flag = 0x0;
                });

                it ('should add the numbers and not affect the flags', () => {
                    let result = addWithCarry(flag, 0x01, 0x02); // 1 + 2 = 3
                    expect(result.flag).toEqual(flag);
                    expect(result.result).toEqual(0x03);
                });

                it('should set the carry flag when result is greater than 255', () => {
                    let result = addWithCarry(flag, 0xFF, 0x01); // 255 + 1 = 256 (or 0 with 1 carry)
                    expect(result.flag & Flags.CarryFlag).toBeTruthy();
                });

                it('should set the zero flag when the result is zero', () => {
                    let result = addWithCarry(flag, 0x00, 0x00); // 0 + 0 = 0
                    expect(result.flag & Flags.ZeroFlag).toBeTruthy();
                });

                it('should set the overflow flag when signed result is < -128', () => {
                    let result = addWithCarry(flag, 0x81, 0xFE); // -127 + -2 = -129 
                    expect(result.flag & Flags.OverflowFlag).toBeTruthy();
                });

                it('should set the overflow flag when signed result is greater than 127', () => {
                    let result = addWithCarry(flag, 0x7F, 0x01); // 127 + 1 = 128 
                    expect(result.flag & Flags.OverflowFlag).toBeTruthy();
                });

                it('should set overflow and carry flags when there is a signed overflow', () => {
                    let result = addWithCarry(flag, 0xD0, 0x90); // -112 + -48 = -160
                    expect(result.flag & Flags.OverflowFlag).toBeTruthy();
                    expect(result.flag & Flags.CarryFlag).toBeTruthy();
                });
            });

        });

        describe('decimal mode set', () => {

            describe('carry flag set' , () => {
                beforeEach(() => {
                    flag = Flags.DecimalFlagSet | Flags.CarryFlagSet;
                });

                it('should add the numbers and reset the carry flag', () => {
                    let result = addWithCarry(flag, 0x22, 0x22); // 22 + 22 (+ carry flag) = 45 
                    expect(result.flag & Flags.CarryFlag).toBeFalsy();
                    expect(result.result).toBe(0x45);
                });

                it('should add the numbers and keep the carry flag set when the math overflows', () => {
                    let result = addWithCarry(flag, 0x50, 0x50); // 50 + 50 (+ carry flag) = 101  
                    expect(result.flag & Flags.CarryFlag).toBeTruthy();
                    expect(result.result).toBe(0x01);
                });
            });

            describe('carry flag not set', () => {
                beforeEach(() => {
                    flag = Flags.DecimalFlagSet;
                });

                it('should add the numbers as packed decimal and keep carry flag clear', () => {
                    let result = addWithCarry(flag, 0x22, 0x22); // 22 + 22 = 44 
                    expect(result.flag & Flags.CarryFlag).toBeFalsy();
                    expect(result.result).toBe(0x44);
                });

                it('should add the numbers as packed decimal and set the carry flag set when the math overflows', () => {
                    let result = addWithCarry(flag, 0x50, 0x55); // 50 + 55 = 105
                    expect(result.flag & Flags.CarryFlag).toBeTruthy();
                    expect(result.result).toBe(0x05);
                });
            });
        });
    });
});
