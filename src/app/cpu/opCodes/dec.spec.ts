import { Cpu, initialCpuState, cloneCpu } from '../cpuState';

import { TestBed } from '@angular/core/testing';

import { Flags } from '../constants';

import { DecFamily } from './dec';

describe('DEC', () => {

    let dec: DecFamily = null;
    let cpu: Cpu = null;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ DecFamily ]
        });

        dec = new DecFamily();
        cpu = initialCpuState();

    });

    it ('should set sign flag when result is signed', () => {
        cpu.memory[cpu.rPC] = 0x00;
        cpu.memory[0x00] = 0x00;
        dec.execute(cpu, 0xC6);
        expect(cpu.rP & Flags.NegativeFlag).toBeTruthy();
    });

    it ('should set zero flag when result is zero', () => {
        cpu.memory[cpu.rPC] = 0x00;
        cpu.memory[0x00] = 0x01;
        dec.execute(cpu, 0xC6);
        expect(cpu.rP & Flags.ZeroFlag).toBeTruthy();
    });

    it ('should reset sign flag when result is unsigned', () => {
        cpu.memory[cpu.rPC] = 0x00;
        cpu.memory[0x00] = 0x80;
        cpu.rP = Flags.NegativeFlag;
        dec.execute(cpu, 0xC6);
        expect(cpu.rP & Flags.NegativeFlag).toBeFalsy();
    });

    it ('should reset zero flag when result is not zero', () => {
        cpu.memory[cpu.rPC] = 0x00;
        cpu.memory[0x00] = 0x02;
        cpu.rP = Flags.ZeroFlag;
        dec.execute(cpu, 0xC6);
        expect(cpu.rP & Flags.ZeroFlag).toBeFalsy();
    });

    it('should handle zero page', () => {
        cpu.memory[cpu.rPC] = 0x00;
        cpu.memory[0x00] = 0x7F;
        dec.execute(cpu, 0xC6);
        expect(cpu.memory[0x00]).toBe(0x7E);
    });

    it('should handle zero page, X', () => {
        cpu.memory[cpu.rPC] = 0x00;
        cpu.memory[0x01] = 0x7F;
        cpu.rX = 0x01;
        dec.execute(cpu, 0xD6);
        expect(cpu.memory[0x01]).toBe(0x7E);
    });

    it('should handle absolute', () => {
        cpu.memory[cpu.rPC] = 0x00;
        cpu.memory[cpu.rPC + 1] = 0xC0;
        dec.execute(cpu, 0xCE);
        expect(cpu.memory[0xC000]).toBe(0xFF);
    });

    it('should handle absolute, X', () => {
        cpu.memory[cpu.rPC] = 0x00;
        cpu.memory[cpu.rPC + 1] = 0xC0;
        cpu.rX = 0x01;
        dec.execute(cpu, 0xDE);
        expect(cpu.memory[0xC001]).toBe(0xFF);
    });
});
