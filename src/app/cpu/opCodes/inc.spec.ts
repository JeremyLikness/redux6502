import { Cpu, initialCpuState, cloneCpu } from '../cpuState';

import { TestBed } from '@angular/core/testing';

import { Flags } from '../constants';

import { IncFamily } from './inc';

describe('INC', () => {

    let inc: IncFamily = null;
    let cpu: Cpu = null;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ IncFamily ]
        });

        inc = new IncFamily();
        cpu = initialCpuState();

    });

    it ('should set sign flag when result is signed', () => {
        cpu.memory[cpu.rPC] = 0x00;
        cpu.memory[0x00] = 0x7F;
        inc.execute(cpu, 0xE6);
        expect(cpu.rP & Flags.NegativeFlag).toBeTruthy();
    });

    it ('should set zero flag when result is zero', () => {
        cpu.memory[cpu.rPC] = 0x00;
        cpu.memory[0x00] = 0xFF;
        inc.execute(cpu, 0xE6);
        expect(cpu.rP & Flags.ZeroFlag).toBeTruthy();
    });

    it ('should reset sign flag when result is unsigned', () => {
        cpu.memory[cpu.rPC] = 0x00;
        cpu.memory[0x00] = 0x7E;
        cpu.rP = Flags.NegativeFlag;
        inc.execute(cpu, 0xE6);
        expect(cpu.rP & Flags.NegativeFlag).toBeFalsy();
    });

    it ('should reset zero flag when result is not zero', () => {
        cpu.memory[cpu.rPC] = 0x00;
        cpu.memory[0x00] = 0x7E;
        cpu.rP = Flags.ZeroFlag;
        inc.execute(cpu, 0xE6);
        expect(cpu.rP & Flags.ZeroFlag).toBeFalsy();
    });

    it('should handle zero page', () => {
        cpu.memory[cpu.rPC] = 0x00;
        cpu.memory[0x00] = 0x7F;
        inc.execute(cpu, 0xE6);
        expect(cpu.memory[0x00]).toBe(0x80);
    });

    it('should handle zero page, X', () => {
        cpu.memory[cpu.rPC] = 0x00;
        cpu.memory[0x01] = 0x7F;
        cpu.rX = 0x01;
        inc.execute(cpu, 0xF6);
        expect(cpu.memory[0x01]).toBe(0x80);
    });

    it('should handle absolute', () => {
        cpu.memory[cpu.rPC] = 0x00;
        cpu.memory[cpu.rPC + 1] = 0xC0;
        inc.execute(cpu, 0xEE);
        expect(cpu.memory[0xC000]).toBe(0x01);
    });

    it('should handle absolute, X', () => {
        cpu.memory[cpu.rPC] = 0x00;
        cpu.memory[cpu.rPC + 1] = 0xC0;
        cpu.rX = 0x01;
        inc.execute(cpu, 0xFE);
        expect(cpu.memory[0xC001]).toBe(0x01);
    });
});
