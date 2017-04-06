import { Address, OpCodeValue, Byte, poke } from '../globals';

import { Flags } from '../constants';

import { Cpu, initialCpuState } from '../cpuState';

import { TestBed } from '@angular/core/testing';

import { CpxFamily } from './cpx';

interface ITestCompareX {
    programCounter: Address;
    programCounterAfter: Address;
    setUpAddress: Address;
    opCode: OpCodeValue;
    setUpBytes: Byte[];
    test: string;
}

const compareTests: ITestCompareX[] = [{
    programCounter: 0x00,
    programCounterAfter: 0x01,
    opCode: 0xE0,
    setUpAddress: 0x00,
    setUpBytes: [0x7F],
    test: 'CPX immediate compares the correct byte'
}, {
    programCounter: 0x00,
    programCounterAfter: 0x01,
    opCode: 0xE4,
    setUpAddress: 0x00,
    setUpBytes: [0x01, 0x7F],
    test: 'CPX zero page compares the correct byte'
}, {
    programCounter: 0x00,
    programCounterAfter: 0x02,
    opCode: 0xEC,
    setUpAddress: 0x00,
    setUpBytes: [0x02, 0x00, 0x7F],
    test: 'CPX absolute compares the correct byte'
}];

const apply = (cpu: Cpu, test: ITestCompareX) => {
    cpu.rPC = test.programCounter;
    cpu.rX = 0x7F;
    poke(cpu, test.setUpAddress, test.setUpBytes);
};

describe('CPX', () => {

    let cpx: CpxFamily = null;
    let cpu: Cpu = null;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [CpxFamily]
        });

        cpx = new CpxFamily();
        cpu = initialCpuState();

    });

    compareTests.forEach(test => {
        it(test.test, () => {
            apply(cpu, test);
            cpx.execute(cpu, test.opCode);
            expect(cpu.rP & Flags.CarryFlag).toBeTruthy();
            expect(cpu.rP & Flags.ZeroFlag).toBeTruthy();
            expect(cpu.rPC).toBe(test.programCounterAfter);
        });
    });

});
