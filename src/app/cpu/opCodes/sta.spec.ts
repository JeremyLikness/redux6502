import { Address, OpCodeValue, Byte, poke } from '../globals';

import { Flags } from '../constants';

import { Cpu, initialCpuState } from '../cpuState';

import { TestBed } from '@angular/core/testing';

import { StaFamily } from './sta';

interface ITestStoreAccumulator {
    programCounter: Address;
    programCounterAfter: Address;
    setUpAddress: Address;
    opCode: OpCodeValue;
    setUpBytes: Byte[];
    aValue: Byte;
    xValue: Byte;
    yValue: Byte;
    expectedAddress: Address;
    test: string;
}

const tests: ITestStoreAccumulator[] = [{
    programCounter: 0x00,
    programCounterAfter: 0x01,
    opCode: 0x85,
    setUpAddress: 0x00,
    setUpBytes: [0x02],
    aValue: 0x7F,
    xValue: 0x0,
    yValue: 0x0,
    expectedAddress: 0x0002,
    test: 'STA zero page stores the correct byte'
}, {
    programCounter: 0x00,
    programCounterAfter: 0x01,
    opCode: 0x95,
    setUpAddress: 0x00,
    setUpBytes: [0x02],
    aValue: 0x7F,
    xValue: 0x2,
    yValue: 0x0,
    expectedAddress: 0x0004,
    test: 'STA zero page, x stores the correct byte'
}, {
    programCounter: 0x00,
    programCounterAfter: 0x02,
    opCode: 0x8D,
    setUpAddress: 0x00,
    setUpBytes: [0x1F, 0xC0],
    aValue: 0x7F,
    xValue: 0x0,
    yValue: 0x0,
    expectedAddress: 0xC01F,
    test: 'STA absolute stores the correct byte'
}, {
    programCounter: 0x00,
    programCounterAfter: 0x02,
    opCode: 0x9D,
    setUpAddress: 0x00,
    setUpBytes: [0x1F, 0xC0],
    aValue: 0x7F,
    xValue: 0x1,
    yValue: 0x0,
    expectedAddress: 0xC020,
    test: 'STA absolute, X stores the correct byte'
}, {
    programCounter: 0x00,
    programCounterAfter: 0x02,
    opCode: 0x99,
    setUpAddress: 0x00,
    setUpBytes: [0x1F, 0xC0],
    aValue: 0x7F,
    xValue: 0x0,
    yValue: 0x1,
    expectedAddress: 0xC020,
    test: 'STA absolute, Y stores the correct byte'
}, {
    programCounter: 0x00,
    programCounterAfter: 0x01,
    opCode: 0x81,
    setUpAddress: 0x00,
    setUpBytes: [0x01, 0x02, 0x1F, 0xD0],
    aValue: 0x7F,
    xValue: 0x1,
    yValue: 0x0,
    expectedAddress: 0xD01F,
    test: 'STA indexed indirect X stores the correct byte'
}, {
    programCounter: 0x00,
    programCounterAfter: 0x01,
    opCode: 0x91,
    setUpAddress: 0x00,
    setUpBytes: [0x01, 0x10, 0x80],
    aValue: 0x7F,
    xValue: 0x0,
    yValue: 0x1,
    expectedAddress: 0x8011,
    test: 'STA indirect indexed Y stores the correct byte'
}];

const apply = (cpu: Cpu, test: ITestStoreAccumulator) => {
    cpu.rPC = test.programCounter;
    poke(cpu, test.setUpAddress, test.setUpBytes);
    cpu.rA = test.aValue;
    cpu.rX = test.xValue;
    cpu.rY = test.yValue;
};

describe('sta', () => {

    let sta: StaFamily = null;
    let cpu: Cpu = null;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [StaFamily]
        });

        sta = new StaFamily();
        cpu = initialCpuState();

    });

    tests.forEach(test => {
        it(test.test, () => {
            apply(cpu, test);
            sta.execute(cpu, test.opCode);
            expect(cpu.memory[test.expectedAddress]).toBe(test.aValue);
            expect(cpu.rPC).toBe(test.programCounterAfter);
        });
    });

});
