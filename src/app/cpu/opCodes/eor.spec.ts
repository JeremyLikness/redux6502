import { Address, OpCodeValue, Byte, poke } from '../globals';

import { Flags } from '../constants';

import { Cpu, initialCpuState } from '../cpuState';

import { TestBed } from '@angular/core/testing';

import { XorFamily } from './eor';

interface ITestXorAccumulator {
    programCounter: Address;
    programCounterAfter: Address;
    setUpAddress: Address;
    opCode: OpCodeValue;
    setUpBytes: Byte[];
    xValue: Byte;
    yValue: Byte;
    test: string;
}

let tests: ITestXorAccumulator[] = [{
    programCounter: 0x00,
    programCounterAfter: 0x01,
    opCode: 0x49,
    setUpAddress: 0x00,
    setUpBytes: [0x03],
    xValue: 0x0,
    yValue: 0x0,
    test: 'XOR immediate exlusive ors the correct byte'
}, {
    programCounter: 0x00,
    programCounterAfter: 0x01,
    opCode: 0x45,
    setUpAddress: 0x00,
    setUpBytes: [0x01, 0x03],
    xValue: 0x0,
    yValue: 0x0,
    test: 'XOR zero page exlusive ors the correct byte'
}, {
    programCounter: 0x00,
    programCounterAfter: 0x01,
    opCode: 0x55,
    setUpAddress: 0x00,
    setUpBytes: [0x01, 0x00, 0x03],
    xValue: 0x01,
    yValue: 0x0,
    test: 'XOR zero page, X exlusive ors the correct byte'
}, {
    programCounter: 0x00,
    programCounterAfter: 0x02,
    opCode: 0x4D,
    setUpAddress: 0x00,
    setUpBytes: [0x02, 0x00, 0x03],
    xValue: 0x00,
    yValue: 0x0,
    test: 'XOR absolute exlusive ors the correct byte'
}, {
    programCounter: 0x00,
    programCounterAfter: 0x02,
    opCode: 0x5D,
    setUpAddress: 0x00,
    setUpBytes: [0x02, 0x00, 0x00, 0x03],
    xValue: 0x01,
    yValue: 0x0,
    test: 'XOR absolute, X exlusive ors the correct byte'
}, {
    programCounter: 0x00,
    programCounterAfter: 0x02,
    opCode: 0x59,
    setUpAddress: 0x00,
    setUpBytes: [0x02, 0x00, 0x00, 0x03],
    xValue: 0x0,
    yValue: 0x01,
    test: 'XOR absolute, Y exlusive ors the correct byte'
}, {
    programCounter: 0x00,
    programCounterAfter: 0x01,
    opCode: 0x41,
    setUpAddress: 0x00,
    setUpBytes: [0x00, 0x03, 0x00, 0x03],
    xValue: 0x01,
    yValue: 0x0,
    test: 'XOR indexed, indirect X exlusive ors the correct byte'
}, {
    programCounter: 0x00,
    programCounterAfter: 0x01,
    opCode: 0x51,
    setUpAddress: 0x00,
    setUpBytes: [0x00, 0x00, 0x03],
    xValue: 0x0,
    yValue: 0x02,
    test: 'XOR indirect, indexed Y exlusive ors the correct byte'
}];

const apply = (cpu: Cpu, test: ITestXorAccumulator) => {
    cpu.rPC = test.programCounter;
    cpu.rA = 0x01;
    poke(cpu, test.setUpAddress, test.setUpBytes);
    cpu.rX = test.xValue;
    cpu.rY = test.yValue;
};

describe('XOR', () => {

    let xor: XorFamily = null;
    let cpu: Cpu = null;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ XorFamily ]
        });

        xor = new XorFamily();
        cpu = initialCpuState();

    });

    describe('flags', () => {

        it('sets the sign flag', () => {
            cpu.rA = 0x01;
            cpu.memory[cpu.rPC] = 0x80;
            xor.execute(cpu, 0x49);
            expect(cpu.rP & Flags.NegativeFlag).toBeTruthy();
        });

        it('sets the zero flag', () => {
            cpu.rA = 0x01;
            cpu.memory[cpu.rPC] = 0x01;
            xor.execute(cpu, 0x49);
            expect(cpu.rP & Flags.ZeroFlag).toBeTruthy();
        });

    });

    tests.forEach(test => {
        it(test.test, () => {
            apply(cpu, test);
            xor.execute(cpu, test.opCode);
            expect(cpu.rA).toBe(0x02);
            expect(cpu.rPC).toBe(test.programCounterAfter);
        });
    });

});
