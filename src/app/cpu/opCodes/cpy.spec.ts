import { Address, OpCodeValue, Byte, poke } from '../globals';

import { Flags } from '../constants';

import { Cpu, initialCpuState } from '../cpuState';

import { TestBed } from '@angular/core/testing';

import { CpyFamily } from './cpy';

interface ITestCompareY {
    programCounter: Address;
    programCounterAfter: Address;
    setUpAddress: Address;
    opCode: OpCodeValue;
    setUpBytes: Byte[];
    test: string;
}

const compareTests: ITestCompareY[] = [{
    programCounter: 0x00,
    programCounterAfter: 0x01,
    opCode: 0xC0,
    setUpAddress: 0x00,
    setUpBytes: [0x7F],
    test: 'CPY immediate compares the correct byte'
}, {
    programCounter: 0x00,
    programCounterAfter: 0x01,
    opCode: 0xC4,
    setUpAddress: 0x00,
    setUpBytes: [0x01, 0x7F],
    test: 'CPY zero page compares the correct byte'
}, {
    programCounter: 0x00,
    programCounterAfter: 0x02,
    opCode: 0xCC,
    setUpAddress: 0x00,
    setUpBytes: [0x02, 0x00, 0x7F],
    test: 'CPY absolute compares the correct byte'
}];

const apply = (cpu: Cpu, test: ITestCompareY) => {
    cpu.rPC = test.programCounter;
    cpu.rY = 0x7F;
    poke(cpu, test.setUpAddress, test.setUpBytes);
};

describe('CPY', () => {

    let cpy: CpyFamily = null;
    let cpu: Cpu = null;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [CpyFamily]
        });

        cpy = new CpyFamily();
        cpu = initialCpuState();

    });

    compareTests.forEach(test => {
        it(test.test, () => {
            apply(cpu, test);
            cpy.execute(cpu, test.opCode);
            expect(cpu.rP & Flags.CarryFlag).toBeTruthy();
            expect(cpu.rP & Flags.ZeroFlag).toBeTruthy();
            expect(cpu.rPC).toBe(test.programCounterAfter);
        });
    });

});
