import { Cpu, initialCpuState, cloneCpu } from '../cpuState';

import { Memory } from '../constants';

import { TestBed } from '@angular/core/testing';

import { JsrFamily } from './jsr';

describe('jsr', () => {

    let jsr: JsrFamily = null;
    let cpu: Cpu = null;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ JsrFamily ]
        });

        jsr = new JsrFamily();
        cpu = initialCpuState();
        cpu.rPC = 0xC000;
        cpu.memory[0xC000] = 0x20;
        cpu.memory[0xC001] = 0xD0;
        jsr.execute(cpu, 0x20);
    });

    it('should set the program counter to the absolute address', () => {
        expect(cpu.rPC).toBe(0xD020);
    });

    it('should push the PC address to the stack', () => {
        expect(cpu.memory[cpu.rSP + Memory.Stack]).toBe(0x01);
        expect(cpu.memory[cpu.rSP + Memory.Stack + 1]).toBe(0xC0);
    });
});
