import { Cpu, initialCpuState } from '../cpuState';

import { TestBed } from '@angular/core/testing';

import { JmpFamily } from './jmp';

describe('jmp', () => {

    let jmp: JmpFamily = null;
    let cpu: Cpu = null;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ JmpFamily ]
        });

        jmp = new JmpFamily();
        cpu = initialCpuState();
    });

    it('sets the program counter for an absolute jump', () => {
        cpu.memory[cpu.rPC] = 0x11;
        cpu.memory[cpu.rPC + 1] = 0xC0;
        jmp.execute(cpu, 0x4C);
        expect(cpu.rPC).toBe(0xC011);
    });

    it('sets the program counter for an indirect jump', () => {
        cpu.memory[cpu.rPC] = 0x11;
        cpu.memory[cpu.rPC + 1] = 0xC0;
        cpu.memory[0xC011] = 0xFF;
        cpu.memory[0xC012] = 0xEE;
        jmp.execute(cpu, 0x6C);
        expect(cpu.rPC).toBe(0xEEFF);
    });
});

