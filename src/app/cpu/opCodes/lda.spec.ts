import { Address, OpCodeValue, Byte, poke } from '../globals';

import { Flags } from '../constants';

import { Cpu, initialCpuState } from '../cpuState';

import { TestBed } from '@angular/core/testing';

import { LdaFamily } from './lda';

interface ITestLoadAccumulator {
    programCounter: Address;
    programCounterAfter: Address;
    setUpAddress: Address;
    opCode: OpCodeValue;
    setUpBytes: Byte[];
    xValue: Byte;
    yValue: Byte;
    expectedA: Byte;
    test: string;
}

let tests: ITestLoadAccumulator[] = [{
    programCounter: 0x00,
    programCounterAfter: 0x01,
    opCode: 0xA9,
    setUpAddress: 0x00,
    setUpBytes: [0x7F],
    xValue: 0x0,
    yValue: 0x0,
    expectedA: 0x7F,
    test: 'LDA immediate loads the correct byte'
}, {
    programCounter: 0x00,
    programCounterAfter: 0x01,
    opCode: 0xA5,
    setUpAddress: 0x00,
    setUpBytes: [0x01, 0x7F],
    xValue: 0x0,
    yValue: 0x0,
    expectedA: 0x7F,
    test: 'LDA zero page loads the correct byte'
}, {
    programCounter: 0x00,
    programCounterAfter: 0x01,
    opCode: 0xB5,
    setUpAddress: 0x00,
    setUpBytes: [0x01, 0x00, 0x7F],
    xValue: 0x01,
    yValue: 0x0,
    expectedA: 0x7F,
    test: 'LDA zero page, X loads the correct byte'
}, {
    programCounter: 0x00,
    programCounterAfter: 0x02,
    opCode: 0xAD,
    setUpAddress: 0x00,
    setUpBytes: [0x02, 0x00, 0x7F],
    xValue: 0x00,
    yValue: 0x0,
    expectedA: 0x7F,
    test: 'LDA absolute loads the correct byte'
}, {
    programCounter: 0x00,
    programCounterAfter: 0x02,
    opCode: 0xBD,
    setUpAddress: 0x00,
    setUpBytes: [0x02, 0x00, 0x00, 0x7F],
    xValue: 0x01,
    yValue: 0x0,
    expectedA: 0x7F,
    test: 'LDA absolute, X loads the correct byte'
}, {
    programCounter: 0x00,
    programCounterAfter: 0x02,
    opCode: 0xB9,
    setUpAddress: 0x00,
    setUpBytes: [0x02, 0x00, 0x00, 0x7F],
    xValue: 0x0,
    yValue: 0x01,
    expectedA: 0x7F,
    test: 'LDA absolute, Y loads the correct byte'
}, {
    programCounter: 0x00,
    programCounterAfter: 0x01,
    opCode: 0xA1,
    setUpAddress: 0x00,
    setUpBytes: [0x00, 0x03, 0x00, 0x7F],
    xValue: 0x01,
    yValue: 0x0,
    expectedA: 0x7F,
    test: 'LDA indexed, indirect X loads the correct byte'
}, {
    programCounter: 0x00,
    programCounterAfter: 0x01,
    opCode: 0xB1,
    setUpAddress: 0x00,
    setUpBytes: [0x00, 0x00, 0x7F],
    xValue: 0x0,
    yValue: 0x02,
    expectedA: 0x7F,
    test: 'LDA indirect, indexed Y loads the correct byte'
}];

const apply = (cpu: Cpu, test: ITestLoadAccumulator) => {
    cpu.rPC = test.programCounter;
    poke(cpu, test.setUpAddress, test.setUpBytes);
    cpu.rX = test.xValue;
    cpu.rY = test.yValue;
}

describe('lda', () => {

    let lda: LdaFamily = null;
    let cpu: Cpu = null;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ LdaFamily ]
        });

        lda = new LdaFamily();
        cpu = initialCpuState();

    });

    describe('flags', () => {

        let baseTest = tests[0];

        it('should set the negative flag when high bit value set', () => {
            apply(cpu, baseTest);
            cpu.memory[0x00] = 0x80;
            lda.execute(cpu, baseTest.opCode);
            expect(cpu.rP & Flags.NegativeFlag).toBeTruthy();
        });

        it('should reset the negative flag when high bit value not set', () => {
            apply(cpu, baseTest);
            lda.execute(cpu, baseTest.opCode);
            expect(cpu.rP & Flags.NegativeFlag).toBeFalsy();
        });

        it('should set the zero flag when value is zero', () => {
            apply(cpu, baseTest);
            cpu.memory[0x00] = 0x00;
            lda.execute(cpu, baseTest.opCode);
            expect(cpu.rP & Flags.ZeroFlag).toBeTruthy();
        });

        it('should reset the zero flag when value is not zero', () => {
            apply(cpu, baseTest);
            lda.execute(cpu, baseTest.opCode);
            expect(cpu.rP & Flags.ZeroFlag).toBeFalsy();
        });
    });

    tests.forEach(test => {
        it(test.test, () => {
            apply(cpu, test);
            lda.execute(cpu, test.opCode);
            expect(cpu.rA).toBe(test.expectedA);
            expect(cpu.rPC).toBe(test.programCounterAfter);
        });
    });

});
