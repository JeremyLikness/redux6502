import { Address, OpCodeValue, Byte, poke } from '../globals';

import { Flags } from '../constants';

import { Cpu, initialCpuState } from '../cpuState';

import { TestBed } from '@angular/core/testing';

import { SbcFamily } from './sbc';

interface ITestSubtractAccumulator {
    programCounter: Address;
    programCounterAfter: Address;
    setUpAddress: Address;
    opCode: OpCodeValue;
    setUpBytes: Byte[];
    xValue: Byte;
    yValue: Byte;
    test: string;
}

// these tests just ensure SBC accesses the correct byte \
// for in-depth tests for the add operation and flags, look at math.spec

const tests: ITestSubtractAccumulator[] = [{
    programCounter: 0x00,
    programCounterAfter: 0x01,
    opCode: 0xE9,
    setUpAddress: 0x00,
    setUpBytes: [0x7F],
    xValue: 0x0,
    yValue: 0x0,
    test: 'SBC immediate subtracts the correct byte'
}, {
    programCounter: 0x00,
    programCounterAfter: 0x01,
    opCode: 0xE5,
    setUpAddress: 0x00,
    setUpBytes: [0x01, 0x7F],
    xValue: 0x0,
    yValue: 0x0,
    test: 'SBC zero page subtracts the correct byte'
}, {
    programCounter: 0x00,
    programCounterAfter: 0x01,
    opCode: 0xF5,
    setUpAddress: 0x00,
    setUpBytes: [0x01, 0x00, 0x7F],
    xValue: 0x01,
    yValue: 0x0,
    test: 'SBC zero page, X subtracts the correct byte'
}, {
    programCounter: 0x00,
    programCounterAfter: 0x02,
    opCode: 0xED,
    setUpAddress: 0x00,
    setUpBytes: [0x02, 0x00, 0x7F],
    xValue: 0x00,
    yValue: 0x0,
    test: 'SBC absolute subtracts the correct byte'
}, {
    programCounter: 0x00,
    programCounterAfter: 0x02,
    opCode: 0xFD,
    setUpAddress: 0x00,
    setUpBytes: [0x02, 0x00, 0x00, 0x7F],
    xValue: 0x01,
    yValue: 0x0,
    test: 'SBC absolute, X subtracts the correct byte'
}, {
    programCounter: 0x00,
    programCounterAfter: 0x02,
    opCode: 0xF9,
    setUpAddress: 0x00,
    setUpBytes: [0x02, 0x00, 0x00, 0x7F],
    xValue: 0x0,
    yValue: 0x01,
    test: 'SBC absolute, Y subtracts the correct byte'
}, {
    programCounter: 0x00,
    programCounterAfter: 0x01,
    opCode: 0xE1,
    setUpAddress: 0x00,
    setUpBytes: [0x00, 0x03, 0x00, 0x7F],
    xValue: 0x01,
    yValue: 0x0,
    test: 'SBC indexed, indirect X subtracts the correct byte'
}, {
    programCounter: 0x00,
    programCounterAfter: 0x01,
    opCode: 0xF1,
    setUpAddress: 0x00,
    setUpBytes: [0x00, 0x00, 0x7F],
    xValue: 0x0,
    yValue: 0x02,
    test: 'SBC indirect, indexed Y subtracts the correct byte'
}];

const apply = (cpu: Cpu, test: ITestSubtractAccumulator) => {
    cpu.rPC = test.programCounter;
    cpu.rA = 0x01;
    poke(cpu, test.setUpAddress, test.setUpBytes);
    cpu.rX = test.xValue;
    cpu.rY = test.yValue;
};

describe('SBC', () => {

    let sbc: SbcFamily = null;
    let cpu: Cpu = null;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [SbcFamily]
        });

        sbc = new SbcFamily();
        cpu = initialCpuState();

    });

    describe('flags', () => {

        it('sets the sign flag', () => {
            cpu.rA = 0x81;
            cpu.memory[cpu.rPC] = 0x01;
            cpu.rP |= Flags.CarryFlagSet;
            sbc.execute(cpu, 0xE9);
            expect(cpu.rP & Flags.NegativeFlag).toBeTruthy();
        });

        it('sets the zero flag', () => {
            cpu.rA = 0x00;
            cpu.rP |= Flags.CarryFlagSet; // set before subtract
            sbc.execute(cpu, 0xE9);
            expect(cpu.rP & Flags.ZeroFlag).toBeTruthy();
        });

    });

    tests.forEach(test => {
        it(test.test, () => {
            apply(cpu, test);
            sbc.execute(cpu, test.opCode);
            expect(cpu.rA).toBe(0x81);
            expect(cpu.rPC).toBe(test.programCounterAfter);
        });
    });

});
