import { Address, OpCodeValue, Byte, poke } from '../globals';

import { Flags } from '../constants';

import { Cpu, initialCpuState } from '../cpuState';

import { TestBed } from '@angular/core/testing';

import { LdyFamily } from './ldy';

interface ITestLoadY {
    programCounter: Address;
    programCounterAfter: Address;
    setUpAddress: Address;
    opCode: OpCodeValue;
    setUpBytes: Byte[];
    xValue: Byte;
    expectedY: Byte;
    test: string;
}

const tests: ITestLoadY[] = [{
    programCounter: 0x00,
    programCounterAfter: 0x01,
    opCode: 0xA0,
    setUpAddress: 0x00,
    setUpBytes: [0x7F],
    xValue: 0x0,
    expectedY: 0x7F,
    test: 'LDY immediate loads the correct byte'
}, {
    programCounter: 0x00,
    programCounterAfter: 0x01,
    opCode: 0xA4,
    setUpAddress: 0x00,
    setUpBytes: [0x01, 0x7F],
    xValue: 0x0,
    expectedY: 0x7F,
    test: 'LDY zero page loads the correct byte'
}, {
    programCounter: 0x00,
    programCounterAfter: 0x01,
    opCode: 0xB4,
    setUpAddress: 0x00,
    setUpBytes: [0x01, 0x00, 0x7F],
    xValue: 0x01,
    expectedY: 0x7F,
    test: 'LDY zero page, X loads the correct byte'
}, {
    programCounter: 0x00,
    programCounterAfter: 0x02,
    opCode: 0xAC,
    setUpAddress: 0x00,
    setUpBytes: [0x02, 0x00, 0x7F],
    xValue: 0x0,
    expectedY: 0x7F,
    test: 'LDY absolute loads the correct byte'
}, {
    programCounter: 0x00,
    programCounterAfter: 0x02,
    opCode: 0xBC,
    setUpAddress: 0x00,
    setUpBytes: [0x02, 0x00, 0x00, 0x7F],
    xValue: 0x01,
    expectedY: 0x7F,
    test: 'LDY absolute, X loads the correct byte'
}];

const apply = (cpu: Cpu, test: ITestLoadY) => {
    cpu.rPC = test.programCounter;
    poke(cpu, test.setUpAddress, test.setUpBytes);
    cpu.rX = test.xValue;
};

describe('ldy', () => {

    let ldy: LdyFamily = null;
    let cpu: Cpu = null;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [LdyFamily]
        });

        ldy = new LdyFamily();
        cpu = initialCpuState();

    });

    describe('flags', () => {

        const baseTest = tests[0];

        it('should set the negative flag when high bit value set', () => {
            apply(cpu, baseTest);
            cpu.memory[0x00] = 0x80;
            ldy.execute(cpu, baseTest.opCode);
            expect(cpu.rP & Flags.NegativeFlag).toBeTruthy();
        });

        it('should reset the negative flag when high bit value not set', () => {
            apply(cpu, baseTest);
            ldy.execute(cpu, baseTest.opCode);
            expect(cpu.rP & Flags.NegativeFlag).toBeFalsy();
        });

        it('should set the zero flag when value is zero', () => {
            apply(cpu, baseTest);
            cpu.memory[0x00] = 0x00;
            ldy.execute(cpu, baseTest.opCode);
            expect(cpu.rP & Flags.ZeroFlag).toBeTruthy();
        });

        it('should reset the zero flag when value is not zero', () => {
            apply(cpu, baseTest);
            ldy.execute(cpu, baseTest.opCode);
            expect(cpu.rP & Flags.ZeroFlag).toBeFalsy();
        });
    });

    tests.forEach(test => {
        it(test.test, () => {
            apply(cpu, test);
            ldy.execute(cpu, test.opCode);
            expect(cpu.rY).toBe(test.expectedY);
            expect(cpu.rPC).toBe(test.programCounterAfter);
        });
    });

});
