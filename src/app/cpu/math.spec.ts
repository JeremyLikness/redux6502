import {
    addWithCarry,
    subtractWithCarry,
    compareWithFlag,
    Byte,
    Flag,
    hexHelper,
    toHex,
    toDecimal } from './globals';
import { Flags, Memory } from './constants';

import { TestBed } from '@angular/core/testing';

describe('math', () => {

    let flag: Flag = 0x0;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ addWithCarry, subtractWithCarry, compareWithFlag ]
        });
    });

    describe('add with carry', () => {

        describe('with decimal mode not set', () => {

            describe('with carry flag set' , () => {

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

            describe('with carry flag not set', () => {

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

        describe('with decimal mode set', () => {

            describe('with carry flag set' , () => {
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

            describe('with carry flag not set', () => {
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

    interface ISubtractTest {
        carryFlag: boolean;
        decimalFlag: boolean;
        accumulator: Byte;
        immediate: Byte;
        expectedResult: Byte;
        expectedCarry: boolean;
        expectedOverflow: boolean;
        expectedZero: boolean;
        expectedNegative: boolean;
    }

    let sbcTests: ISubtractTest[] = [{
            carryFlag: true,
            decimalFlag: false,
            accumulator: 0x20,
            immediate: 0x10,
            expectedResult: 0x10,
            expectedCarry: true,
            expectedOverflow: false,
            expectedZero: false,
            expectedNegative: false
        },
        {
            carryFlag: true,
            decimalFlag: false,
            accumulator: 0x20,
            immediate: 0x20,
            expectedResult: 0x00,
            expectedCarry: true,
            expectedOverflow: false,
            expectedZero: true,
            expectedNegative: false
        },
        {
            carryFlag: true,
            decimalFlag: false,
            accumulator: 0x20,
            immediate: 0x21,
            expectedResult: 0xFF,
            expectedCarry: false,
            expectedOverflow: false,
            expectedZero: false,
            expectedNegative: true
        },
        {
            carryFlag: true,
            decimalFlag: false,
            accumulator: 0x20,
            immediate: 0x81,
            expectedResult: 0x9F,
            expectedCarry: false,
            expectedOverflow: true,
            expectedZero: false,
            expectedNegative: true
        },
        {
            carryFlag: true,
            decimalFlag: false,
            accumulator: 0x90,
            immediate: 0x40,
            expectedResult: 0x50,
            expectedCarry: true,
            expectedOverflow: true,
            expectedZero: false,
            expectedNegative: false
        },
        {
            carryFlag: true,
            decimalFlag: false,
            accumulator: 0x90,
            immediate: 0x90,
            expectedResult: 0x00,
            expectedCarry: true,
            expectedOverflow: false,
            expectedZero: true,
            expectedNegative: false
        },
        {
            carryFlag: true,
            decimalFlag: false,
            accumulator: 0x90,
            immediate: 0xa0,
            expectedResult: 0xF0,
            expectedCarry: false,
            expectedOverflow: false,
            expectedZero: false,
            expectedNegative: true
        },
        {
            carryFlag: false,
            decimalFlag: false,
            accumulator: 0x20,
            immediate: 0x10,
            expectedResult: 0x0F,
            expectedCarry: true,
            expectedOverflow: false,
            expectedZero: false,
            expectedNegative: false
        },
        {
            carryFlag: false,
            decimalFlag: false,
            accumulator: 0x20,
            immediate: 0x20,
            expectedResult: 0xFF,
            expectedCarry: false,
            expectedOverflow: false,
            expectedZero: false,
            expectedNegative: true
        },
        {
            carryFlag: false,
            decimalFlag: false,
            accumulator: 0x20,
            immediate: 0x21,
            expectedResult: 0xFE,
            expectedCarry: false,
            expectedOverflow: false,
            expectedZero: false,
            expectedNegative: true
        },
        {
            carryFlag: false,
            decimalFlag: false,
            accumulator: 0x20,
            immediate: 0x81,
            expectedResult: 0x9E,
            expectedCarry: false,
            expectedOverflow: true,
            expectedZero: false,
            expectedNegative: true
        },
        {
            carryFlag: false,
            decimalFlag: false,
            accumulator: 0x90,
            immediate: 0x40,
            expectedResult: 0x4F,
            expectedCarry: true,
            expectedOverflow: true,
            expectedZero: false,
            expectedNegative: false
        },
        {
            carryFlag: false,
            decimalFlag: false,
            accumulator: 0x90,
            immediate: 0x90,
            expectedResult: 0xFF,
            expectedCarry: false,
            expectedOverflow: false,
            expectedZero: false,
            expectedNegative: true
        },
        {
            carryFlag: false,
            decimalFlag: false,
            accumulator: 0x90,
            immediate: 0xa0,
            expectedResult: 0xEF,
            expectedCarry: false,
            expectedOverflow: false,
            expectedZero: false,
            expectedNegative: true
        }];

    describe('subtract with carry', () => {
        sbcTests.forEach(test => {
            let description = `sbc with carry flag ${test.carryFlag ? 'set' : 'reset' } and decimal flag` +
                ` ${test.decimalFlag ? 'set' : 'reset'} of ${test.accumulator}-${test.immediate}`;
            let initialFlag: Flag = test.carryFlag ? Flags.CarryFlag : 0x0;
            if (test.decimalFlag) {
                initialFlag |= Flags.DecimalFlag;
            }
            let result = subtractWithCarry(initialFlag, test.accumulator, test.immediate);
            it(description + ` should equal ${test.expectedResult}`, () => {
                expect(result.result).toBe(test.expectedResult);
            });
            it(description + ` should ${test.expectedCarry ? 'set' : 'reset'} the carry flag`, () => {
                if (test.expectedCarry) {
                    expect(result.flag & Flags.CarryFlag).toBeTruthy();
                } else {
                    expect(result.flag & Flags.CarryFlag).toBeFalsy();
                }
            });
            it(description + ` should ${test.expectedOverflow ? 'set' : 'reset'} the overflow flag`, () => {
                if (test.expectedOverflow) {
                    expect(result.flag & Flags.OverflowFlag).toBeTruthy();
                } else {
                    expect(result.flag & Flags.OverflowFlag).toBeFalsy();
                }
            });
            it(description + ` should ${test.expectedNegative ? 'set' : 'reset'} the sign flag`, () => {
                if (test.expectedNegative) {
                    expect(result.flag & Flags.NegativeFlag).toBeTruthy();
                } else {
                    expect(result.flag & Flags.NegativeFlag).toBeFalsy();
                }
            });
            it(description + ` should ${test.expectedZero ? 'set' : 'reset'} the zero flag`, () => {
                if (test.expectedZero) {
                    expect(result.flag & Flags.ZeroFlag).toBeTruthy();
                } else {
                    expect(result.flag & Flags.ZeroFlag).toBeFalsy();
                }
            });
        });
    });

    describe('compare with flag', () => {

    // equal to = CZ 
    // greater than = C 
    // less than = 

        it ('sets carry and zero flag when values are equal', () => {
            let result = compareWithFlag(0x0, 0x55, 0x55);
            expect(result & Flags.CarryFlag).toBeTruthy();
            expect(result & Flags.ZeroFlag).toBeTruthy();
        });

        it ('sets carry flag only when register is greater than value', () => {
            let result = compareWithFlag(0x0, 0x55, 0x54);
            expect(result & Flags.CarryFlag).toBeTruthy();
            expect(result & Flags.ZeroFlag).toBeFalsy();
        });

        it ('does not set flags when register is less than value', () => {
            let result = compareWithFlag(0x0, 0x55, 0x56);
            expect(result & Flags.CarryFlag).toBeFalsy();
            expect(result & Flags.ZeroFlag).toBeFalsy();
        });

        it ('sets the sign flag when the result of comparison is signed', () => {
            let result = compareWithFlag(0x0, 0x81, 0x01);
            expect(result & Flags.NegativeFlag).toBeTruthy();
        });

        it ('resets the sign flag when the result of comparison is not signed', () => {
            let result = compareWithFlag(0x0, 0x7F, 0x01);
            expect(result & Flags.NegativeFlag).toBeFalsy();
        });
    });

    describe('decimal matrix', () => {

        // matrix of possible addition and subtraction 
        let ten = 0, one = 0, targetTen = 0, targetOne = 0;
        while (ten < 10) {
            let left = ten * 10 + one,
                right = targetTen * 10 + one,
                expectedAdd = left + right,
                expectedSubtract = left - right;
            it(`adds ${left} (${hexHelper(toHex(left),2)}) and ${right} (${hexHelper(toHex(right),2)}) correctly`, () => {
                let result = addWithCarry(Flags.DecimalFlagSet, toHex(left), toHex(right)), expected = expectedAdd;
                if (expected >= 100) {
                    expect(toDecimal(result.result)).toBe(expected - 100);
                    expect(result.flag & Flags.CarryFlag).toBeTruthy();
                } else {
                    expect(toDecimal(result.result)).toBe(expected);
                    expect(result.flag & Flags.CarryFlag).toBeFalsy();
                }
            });
            it(`subtracts ${right} (${hexHelper(toHex(right),2)}) from ${left} (${hexHelper(toHex(left),2)}) correctly`, () => {
                let result = subtractWithCarry(Flags.DecimalFlagSet | Flags.CarryFlagSet,
                    toHex(left),
                    toHex(right)),
                    expected = expectedSubtract;
                if (expected < 0) {
                    expect(toDecimal(result.result)).toBe(100 + expected);
                    expect(result.flag & Flags.CarryFlag).toBeFalsy();
                } else {
                    expect(toDecimal(result.result)).toBe(expected);
                    expect(result.flag & Flags.CarryFlag).toBeTruthy();
                }
            });
            targetOne += 5;
            if (targetOne === 10) {
                targetOne = 0;
                targetTen += 5;
                if (targetTen === 10) {
                    targetTen = 0;
                    targetOne = 0;
                    one += 5;
                    if (one === 10) {
                        one = 0;
                        ten += 5;
                    }
                }
            }
        }
    });
});

