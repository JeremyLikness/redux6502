import { Address, OpCodeValue, Byte, poke } from '../globals';

import { Flags } from '../constants';

import { Cpu, initialCpuState } from '../cpuState';

import { TestBed } from '@angular/core/testing';

import { OrFamily } from './ora';

interface ITestOrAccumulator {
    programCounter: Address;
    programCounterAfter: Address;
    setUpAddress: Address;
    opCode: OpCodeValue;
    setUpBytes: Byte[];
    xValue: Byte;
    yValue: Byte;
    test: string;
}

const tests: ITestOrAccumulator[] = [{
    programCounter: 0x00,
    programCounterAfter: 0x01,
    opCode: 0x09,
    setUpAddress: 0x00,
    setUpBytes: [0x01],
    xValue: 0x0,
    yValue: 0x0,
    test: 'OR immediate logically ors the correct byte'
}, {
    programCounter: 0x00,
    programCounterAfter: 0x01,
    opCode: 0x05,
    setUpAddress: 0x00,
    setUpBytes: [0x01, 0x01],
    xValue: 0x0,
    yValue: 0x0,
    test: 'OR zero page logically ors the correct byte'
}, {
    programCounter: 0x00,
    programCounterAfter: 0x01,
    opCode: 0x15,
    setUpAddress: 0x00,
    setUpBytes: [0x01, 0x00, 0x01],
    xValue: 0x01,
    yValue: 0x0,
    test: 'OR zero page, X logically ors the correct byte'
}, {
    programCounter: 0x00,
    programCounterAfter: 0x02,
    opCode: 0x0D,
    setUpAddress: 0x00,
    setUpBytes: [0x02, 0x00, 0x01],
    xValue: 0x00,
    yValue: 0x0,
    test: 'OR absolute logically ors the correct byte'
}, {
    programCounter: 0x00,
    programCounterAfter: 0x02,
    opCode: 0x1D,
    setUpAddress: 0x00,
    setUpBytes: [0x02, 0x00, 0x00, 0x01],
    xValue: 0x01,
    yValue: 0x0,
    test: 'OR absolute, X logically ors the correct byte'
}, {
    programCounter: 0x00,
    programCounterAfter: 0x02,
    opCode: 0x19,
    setUpAddress: 0x00,
    setUpBytes: [0x02, 0x00, 0x00, 0x01],
    xValue: 0x0,
    yValue: 0x01,
    test: 'OR absolute, Y logically ors the correct byte'
}, {
    programCounter: 0x00,
    programCounterAfter: 0x01,
    opCode: 0x01,
    setUpAddress: 0x00,
    setUpBytes: [0x00, 0x03, 0x00, 0x01],
    xValue: 0x01,
    yValue: 0x0,
    test: 'OR indexed, indirect X logically ors the correct byte'
}, {
    programCounter: 0x00,
    programCounterAfter: 0x01,
    opCode: 0x11,
    setUpAddress: 0x00,
    setUpBytes: [0x00, 0x00, 0x01],
    xValue: 0x0,
    yValue: 0x02,
    test: 'OR indirect, indexed Y logically ors the correct byte'
}];

const apply = (cpu: Cpu, test: ITestOrAccumulator) => {
    cpu.rPC = test.programCounter;
    cpu.rA = 0x80;
    poke(cpu, test.setUpAddress, test.setUpBytes);
    cpu.rX = test.xValue;
    cpu.rY = test.yValue;
};

describe('OR', () => {

    let or: OrFamily = null;
    let cpu: Cpu = null;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [OrFamily]
        });

        or = new OrFamily();
        cpu = initialCpuState();

    });

    describe('flags', () => {

        it('sets the sign flag', () => {
            cpu.rA = 0x00;
            cpu.memory[cpu.rPC] = 0x81;
            or.execute(cpu, 0x09);
            expect(cpu.rP & Flags.NegativeFlag).toBeTruthy();
        });

        it('sets the zero flag', () => {
            cpu.rA = 0x00;
            or.execute(cpu, 0x09);
            expect(cpu.rP & Flags.ZeroFlag).toBeTruthy();
        });

    });

    tests.forEach(test => {
        it(test.test, () => {
            apply(cpu, test);
            or.execute(cpu, test.opCode);
            expect(cpu.rA).toBe(0x81);
            expect(cpu.rPC).toBe(test.programCounterAfter);
        });
    });

});
