import { Address, OpCodeValue, Byte, poke } from '../globals';

import { Flags } from '../constants';

import { Cpu, initialCpuState } from '../cpuState';

import { TestBed } from '@angular/core/testing';

import { AndFamily } from './and';

interface ITestAndAccumulator {
    programCounter: Address;
    programCounterAfter: Address;
    setUpAddress: Address;
    opCode: OpCodeValue;
    setUpBytes: Byte[];
    xValue: Byte;
    yValue: Byte;
    test: string;
}

// these tests just ensure SBC accesses the correct byte 
// for in-depth tests for the add operation and flags, look at math.spec

let tests: ITestAndAccumulator[] = [{
    programCounter: 0x00,
    programCounterAfter: 0x01,
    opCode: 0x29,
    setUpAddress: 0x00,
    setUpBytes: [0xFF],
    xValue: 0x0,
    yValue: 0x0,
    test: 'AND immediate logically ands the correct byte'
}, {
    programCounter: 0x00,
    programCounterAfter: 0x01,
    opCode: 0x25,
    setUpAddress: 0x00,
    setUpBytes: [0x01, 0xFF],
    xValue: 0x0,
    yValue: 0x0,
    test: 'AND zero page logically ands the correct byte'
}, {
    programCounter: 0x00,
    programCounterAfter: 0x01,
    opCode: 0x35,
    setUpAddress: 0x00,
    setUpBytes: [0x01, 0x00, 0xFF],
    xValue: 0x01,
    yValue: 0x0,
    test: 'AND zero page, X logically ands the correct byte'
}, {
    programCounter: 0x00,
    programCounterAfter: 0x02,
    opCode: 0x2D,
    setUpAddress: 0x00,
    setUpBytes: [0x02, 0x00, 0xFF],
    xValue: 0x00,
    yValue: 0x0,
    test: 'AND absolute logically ands the correct byte'
}, {
    programCounter: 0x00,
    programCounterAfter: 0x02,
    opCode: 0x3D,
    setUpAddress: 0x00,
    setUpBytes: [0x02, 0x00, 0x00, 0xFF],
    xValue: 0x01,
    yValue: 0x0,
    test: 'AND absolute, X logically ands the correct byte'
}, {
    programCounter: 0x00,
    programCounterAfter: 0x02,
    opCode: 0x39,
    setUpAddress: 0x00,
    setUpBytes: [0x02, 0x00, 0x00, 0xFF],
    xValue: 0x0,
    yValue: 0x01,
    test: 'AND absolute, Y logically ands the correct byte'
}, {
    programCounter: 0x00,
    programCounterAfter: 0x01,
    opCode: 0x21,
    setUpAddress: 0x00,
    setUpBytes: [0x00, 0x03, 0x00, 0xFF],
    xValue: 0x01,
    yValue: 0x0,
    test: 'AND indexed, indirect X logically ands the correct byte'
}, {
    programCounter: 0x00,
    programCounterAfter: 0x01,
    opCode: 0x31,
    setUpAddress: 0x00,
    setUpBytes: [0x00, 0x00, 0xFF],
    xValue: 0x0,
    yValue: 0x02,
    test: 'AND indirect, indexed Y logically ands the correct byte'
}];

const apply = (cpu: Cpu, test: ITestAndAccumulator) => {
    cpu.rPC = test.programCounter;
    cpu.rA = 0x01;
    poke(cpu, test.setUpAddress, test.setUpBytes);
    cpu.rX = test.xValue;
    cpu.rY = test.yValue;
};

describe('AND', () => {

    let and: AndFamily = null;
    let cpu: Cpu = null;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ AndFamily ]
        });

        and = new AndFamily();
        cpu = initialCpuState();

    });

    describe('flags', () => {

        it('sets the sign flag', () => {
            cpu.rA = 0xFF;
            cpu.memory[cpu.rPC] = 0x81;
            and.execute(cpu, 0x29);
            expect(cpu.rP & Flags.NegativeFlag).toBeTruthy();
        });

        it('sets the zero flag', () => {
            cpu.rA = 0x00;
            and.execute(cpu, 0x29);
            expect(cpu.rP & Flags.ZeroFlag).toBeTruthy();
        });

    });

    tests.forEach(test => {
        it(test.test, () => {
            apply(cpu, test);
            and.execute(cpu, test.opCode);
            expect(cpu.rA).toBe(0x01);
            expect(cpu.rPC).toBe(test.programCounterAfter);
        });
    });

});
