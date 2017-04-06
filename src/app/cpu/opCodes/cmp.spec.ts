import { Address, OpCodeValue, Byte, poke } from '../globals';

import { Flags } from '../constants';

import { Cpu, initialCpuState } from '../cpuState';

import { TestBed } from '@angular/core/testing';

import { CmpFamily } from './cmp';

interface ITestCompareAccumulator {
    programCounter: Address;
    programCounterAfter: Address;
    setUpAddress: Address;
    opCode: OpCodeValue;
    setUpBytes: Byte[];
    xValue: Byte;
    yValue: Byte;
    test: string;
}

const compareTests: ITestCompareAccumulator[] = [{
    programCounter: 0x00,
    programCounterAfter: 0x01,
    opCode: 0xC9,
    setUpAddress: 0x00,
    setUpBytes: [0x7F],
    xValue: 0x0,
    yValue: 0x0,
    test: 'CMP immediate compares the correct byte'
}, {
    programCounter: 0x00,
    programCounterAfter: 0x01,
    opCode: 0xC5,
    setUpAddress: 0x00,
    setUpBytes: [0x01, 0x7F],
    xValue: 0x0,
    yValue: 0x0,
    test: 'CMP zero page compares the correct byte'
}, {
    programCounter: 0x00,
    programCounterAfter: 0x01,
    opCode: 0xD5,
    setUpAddress: 0x00,
    setUpBytes: [0x01, 0x00, 0x7F],
    xValue: 0x01,
    yValue: 0x0,
    test: 'CMP zero page, X compares the correct byte'
}, {
    programCounter: 0x00,
    programCounterAfter: 0x02,
    opCode: 0xCD,
    setUpAddress: 0x00,
    setUpBytes: [0x02, 0x00, 0x7F],
    xValue: 0x00,
    yValue: 0x0,
    test: 'CMP absolute compares the correct byte'
}, {
    programCounter: 0x00,
    programCounterAfter: 0x02,
    opCode: 0xDD,
    setUpAddress: 0x00,
    setUpBytes: [0x02, 0x00, 0x00, 0x7F],
    xValue: 0x01,
    yValue: 0x0,
    test: 'CMP absolute, X compares the correct byte'
}, {
    programCounter: 0x00,
    programCounterAfter: 0x02,
    opCode: 0xD9,
    setUpAddress: 0x00,
    setUpBytes: [0x02, 0x00, 0x00, 0x7F],
    xValue: 0x0,
    yValue: 0x01,
    test: 'CMP absolute, Y compares the correct byte'
}, {
    programCounter: 0x00,
    programCounterAfter: 0x01,
    opCode: 0xC1,
    setUpAddress: 0x00,
    setUpBytes: [0x00, 0x03, 0x00, 0x7F],
    xValue: 0x01,
    yValue: 0x0,
    test: 'CMP indexed, indirect X compares the correct byte'
}, {
    programCounter: 0x00,
    programCounterAfter: 0x01,
    opCode: 0xD1,
    setUpAddress: 0x00,
    setUpBytes: [0x00, 0x00, 0x7F],
    xValue: 0x0,
    yValue: 0x02,
    test: 'CMP indirect, indexed Y compares the correct byte'
}];

const apply = (cpu: Cpu, test: ITestCompareAccumulator) => {
    cpu.rPC = test.programCounter;
    cpu.rA = 0x7F;
    poke(cpu, test.setUpAddress, test.setUpBytes);
    cpu.rX = test.xValue;
    cpu.rY = test.yValue;
};

describe('CMP', () => {

    let cmp: CmpFamily = null;
    let cpu: Cpu = null;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [CmpFamily]
        });

        cmp = new CmpFamily();
        cpu = initialCpuState();

    });

    compareTests.forEach(test => {
        it(test.test, () => {
            apply(cpu, test);
            cmp.execute(cpu, test.opCode);
            expect(cpu.rP & Flags.CarryFlag).toBeTruthy();
            expect(cpu.rP & Flags.ZeroFlag).toBeTruthy();
            expect(cpu.rPC).toBe(test.programCounterAfter);
        });
    });

});
