import { Cpu, initialCpuState, cloneCpu } from '../cpuState';

import { TestBed } from '@angular/core/testing';

import { StyFamily } from './sty';

describe('STY', () => {

    let sty: StyFamily = null;
    let cpu: Cpu = null;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [StyFamily]
        });

        sty = new StyFamily();
        cpu = initialCpuState();

    });

    describe('zero page', () => {
        it('should store the y register at the zero page address', () => {
            cpu.rY = 0x7F;
            cpu.memory[cpu.rPC] = 0xEE;
            sty.execute(cpu, 0x84);
            expect(cpu.memory[0xEE]).toBe(0x07F);
        });
    });

    describe('zero page, X', () => {
        it('should store the y register at the zero page address offset by the X register', () => {
            cpu.rY = 0x7F;
            cpu.rX = 0x02;
            cpu.memory[cpu.rPC] = 0xEE;
            sty.execute(cpu, 0x94);
            expect(cpu.memory[0xF0]).toBe(0x07F);
        });
    });

    describe('absolute', () => {
        it('should store the y register at the absolute address', () => {
            cpu.rY = 0x7F;
            cpu.memory[cpu.rPC] = 0xEE;
            cpu.memory[cpu.rPC + 1] = 0xC0;
            sty.execute(cpu, 0x8C);
            expect(cpu.memory[0xC0EE]).toBe(0x07F);
        });
    });
});
