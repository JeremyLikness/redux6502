import { Cpu, initialCpuState, cloneCpu } from '../cpuState';

import { TestBed } from '@angular/core/testing';

import { StxFamily } from './stx';

describe('STX', () => {

    let stx: StxFamily = null;
    let cpu: Cpu = null;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ StxFamily ]
        });

        stx = new StxFamily();
        cpu = initialCpuState();

    });

    describe('zero page', () => {
        it('should store the x register at the zero page address', () => {
            cpu.rX = 0x7F;
            cpu.memory[cpu.rPC] = 0xEE;
            stx.execute(cpu, 0x86);
            expect(cpu.memory[0xEE]).toBe(0x07F);
        });
    });

    describe('zero page, Y', () => {
        it('should store the x register at the zero page address offset by the Y register', () => {
            cpu.rX = 0x7F;
            cpu.rY = 0x02;
            cpu.memory[cpu.rPC] = 0xEE;
            stx.execute(cpu, 0x96);
            expect(cpu.memory[0xF0]).toBe(0x07F);
        });
    });

    describe('absolute', () => {
        it('should store the x register at the absolute address', () => {
            cpu.rX = 0x7F;
            cpu.memory[cpu.rPC] = 0xEE;
            cpu.memory[cpu.rPC + 1] = 0xC0;
            stx.execute(cpu, 0x8E);
            expect(cpu.memory[0xC0EE]).toBe(0x07F);
        });
    });
});
