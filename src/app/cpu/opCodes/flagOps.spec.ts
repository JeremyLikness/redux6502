import { Cpu, initialCpuState, cloneCpu } from '../cpuState';

import { TestBed } from '@angular/core/testing';

import { Flag, OpCodeValue } from '../globals';
import { Flags } from '../constants';

import { FlagFamily } from './flagOps';

interface ITestFlag {
    opCode: OpCodeValue;
    flag: Flag;
    set: boolean;
    test: string;
}

let flagTests: ITestFlag[] = [{
    opCode: 0x18,
    flag: Flags.CarryFlag,
    set: false,
    test: 'CLC clears the carry flag'
}, {
    opCode: 0x38,
    flag: Flags.CarryFlag,
    set: true,
    test: 'SEC sets the carry flag'
}, {
    opCode: 0xB8,
    flag: Flags.OverflowFlag,
    set: false,
    test: 'CLV clears the overflow flag'
}, {
    opCode: 0xD8,
    flag: Flags.DecimalFlag,
    set: false,
    test: 'CLD clears the decimal flag'
}, {
    opCode: 0xF8,
    flag: Flags.DecimalFlag,
    set: true,
    test: 'SED sets the decimal flag'
}];

describe('flags', () => {

    let flags: FlagFamily = null;
    let cpu: Cpu = null;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ FlagFamily ]
        });

        flags = new FlagFamily();
        cpu = initialCpuState();

    });

    flagTests.forEach(test => {
        it(test.test, () => {
            if (test.set === false) {
                cpu.rP = 0xFF; // set them all
            }
            flags.execute(cpu, test.opCode);
            if (test.set) {
                expect(cpu.rP & test.flag).toBeTruthy();
            } else {
                expect(cpu.rP & test.flag).toBeFalsy();
            }
        });
    });
});
