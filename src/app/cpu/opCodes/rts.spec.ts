import { Cpu, initialCpuState, cloneCpu } from '../cpuState';

import { Memory } from '../constants';

import { TestBed } from '@angular/core/testing';

import { RtsFamily } from './rts';

describe('RTS', () => {

    let rts: RtsFamily = null;
    let cpu: Cpu = null;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ RtsFamily ]
        });

        rts = new RtsFamily();
        cpu = initialCpuState();
        cpu.rPC = 0xC000;
        let hiByte = ((cpu.rPC - 1) >> Memory.BitsInByte) & Memory.ByteMask,
                loByte = (cpu.rPC - 1) & Memory.ByteMask;
        cpu.stackPush(hiByte);
        cpu.stackPush(loByte);
        cpu.rPC = 0x100;
        rts.execute(cpu, 0x60);
    });

    it('should set the program counter to address from the stack', () => {
        expect(cpu.rPC).toBe(0xC000);
    });
});
