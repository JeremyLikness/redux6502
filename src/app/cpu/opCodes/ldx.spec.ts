import { Address, OpCodeValue, Byte, poke } from '../globals';

import { Flags } from '../constants';

import { Cpu, initialCpuState } from '../cpuState';

import { TestBed } from '@angular/core/testing';

import { LdxFamily } from './ldx';

interface ITestLoadX {
    programCounter: Address;
    programCounterAfter: Address;
    setUpAddress: Address;
    opCode: OpCodeValue;
    setUpBytes: Byte[];
    yValue: Byte;
    expectedX: Byte;
    test: string;
}

const tests: ITestLoadX[] = [{
    programCounter: 0x00,
    programCounterAfter: 0x01,
    opCode: 0xA2,
    setUpAddress: 0x00,
    setUpBytes: [0x7F],
    yValue: 0x0,
    expectedX: 0x7F,
    test: 'LDX immediate loads the correct byte'
}, {
    programCounter: 0x00,
    programCounterAfter: 0x01,
    opCode: 0x44,
    setUpAddress: 0x00,
    setUpBytes: [0x01, 0x7F],
    yValue: 0x0,
    expectedX: 0x7F,
    test: 'LDX zero page loads the correct byte'
}, {
    programCounter: 0x00,
    programCounterAfter: 0x01,
    opCode: 0xB6,
    setUpAddress: 0x00,
    setUpBytes: [0x01, 0x00, 0x7F],
    yValue: 0x01,
    expectedX: 0x7F,
    test: 'LDX zero page, Y loads the correct byte'
}, {
    programCounter: 0x00,
    programCounterAfter: 0x02,
    opCode: 0xAE,
    setUpAddress: 0x00,
    setUpBytes: [0x02, 0x00, 0x7F],
    yValue: 0x0,
    expectedX: 0x7F,
    test: 'LDX absolute loads the correct byte'
}, {
    programCounter: 0x00,
    programCounterAfter: 0x02,
    opCode: 0xBE,
    setUpAddress: 0x00,
    setUpBytes: [0x02, 0x00, 0x00, 0x7F],
    yValue: 0x01,
    expectedX: 0x7F,
    test: 'LDX absolute, Y loads the correct byte'
}];

const apply = (cpu: Cpu, test: ITestLoadX) => {
    cpu.rPC = test.programCounter;
    poke(cpu, test.setUpAddress, test.setUpBytes);
    cpu.rY = test.yValue;
};

describe('ldx', () => {

    let ldx: LdxFamily = null;
    let cpu: Cpu = null;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [LdxFamily]
        });

        ldx = new LdxFamily();
        cpu = initialCpuState();

    });

    describe('flags', () => {

        const baseTest = tests[0];

        it('should set the negative flag when high bit value set', () => {
            apply(cpu, baseTest);
            cpu.memory[0x00] = 0x80;
            ldx.execute(cpu, baseTest.opCode);
            expect(cpu.rP & Flags.NegativeFlag).toBeTruthy();
        });

        it('should reset the negative flag when high bit value not set', () => {
            apply(cpu, baseTest);
            ldx.execute(cpu, baseTest.opCode);
            expect(cpu.rP & Flags.NegativeFlag).toBeFalsy();
        });

        it('should set the zero flag when value is zero', () => {
            apply(cpu, baseTest);
            cpu.memory[0x00] = 0x00;
            ldx.execute(cpu, baseTest.opCode);
            expect(cpu.rP & Flags.ZeroFlag).toBeTruthy();
        });

        it('should reset the zero flag when value is not zero', () => {
            apply(cpu, baseTest);
            ldx.execute(cpu, baseTest.opCode);
            expect(cpu.rP & Flags.ZeroFlag).toBeFalsy();
        });
    });

    tests.forEach(test => {
        it(test.test, () => {
            apply(cpu, test);
            ldx.execute(cpu, test.opCode);
            expect(cpu.rX).toBe(test.expectedX);
            expect(cpu.rPC).toBe(test.programCounterAfter);
        });
    });

});
