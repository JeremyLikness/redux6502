import { Cpu, initialCpuState } from '../cpuState';
import { Flags, Memory } from '../constants';
import { Byte } from '../globals';

import { TestBed } from '@angular/core/testing';

import { LsrFamily } from './lsr';

describe('LSR', () => {

    let lsr: LsrFamily = null;
    let cpu: Cpu = null;
    let noCarry = parseInt('00000010', 2);
    let carry = parseInt('00000001', 2);

    const checkResult = (src: Byte, result: Byte) => {
        expect(result).toBe((src & 0xFE) >> 1);
    };

    const carryResult = (proc: Cpu, result: Byte) => {
        expect(cpu.rP & Flags.ZeroFlag).toBeTruthy();
        expect(cpu.rP & Flags.CarryFlag).toBeTruthy();
        expect(cpu.rP & Flags.NegativeFlag).toBeFalsy();
    };

    const noCarryResult = (proc: Cpu, result: Byte) => {
        expect(cpu.rP & Flags.ZeroFlag).toBeFalsy();
        expect(cpu.rP & Flags.CarryFlag).toBeFalsy();
        expect(cpu.rP & Flags.NegativeFlag).toBeFalsy();
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ LsrFamily ]
        });

        lsr = new LsrFamily();
        cpu = initialCpuState();
    });

    describe('accumulator', () => {
        it('handles carry and resulting flags', () => {
            cpu.rA = carry;
            lsr.execute(cpu, 0x4A);
            checkResult(carry, cpu.rA);
            carryResult(cpu, cpu.rA);
        });

        it('handles no carry and resulting flags', () => {
            cpu.rA = noCarry;
            lsr.execute(cpu, 0x4A);
            checkResult(noCarry, cpu.rA);
            noCarryResult(cpu, cpu.rA);
        });
    });

    describe('zero page', () => {
        it('handles carry and resulting flags', () => {
            cpu.memory[0x10] = carry;
            cpu.memory[cpu.rPC] = 0x10;
            lsr.execute(cpu, 0x46);
            checkResult(carry, cpu.memory[0x10]);
            carryResult(cpu, cpu.memory[0x10]);
        });

        it('handles no carry and resulting flags', () => {
            cpu.memory[0x10] = noCarry;
            cpu.memory[cpu.rPC] = 0x10;
            lsr.execute(cpu, 0x46);
            checkResult(noCarry, cpu.memory[0x10]);
            noCarryResult(cpu, cpu.memory[0x10]);
        });
    });

    describe('zero page, x', () => {
        it('handles carry and resulting flags', () => {
            cpu.memory[0x11] = carry;
            cpu.rX = 0x01;
            cpu.memory[cpu.rPC] = 0x10;
            lsr.execute(cpu, 0x56);
            checkResult(carry, cpu.memory[0x11]);
            carryResult(cpu, cpu.memory[0x11]);
        });

        it('handles no carry and resulting flags', () => {
            cpu.memory[0x11] = noCarry;
            cpu.rX = 0x01;
            cpu.memory[cpu.rPC] = 0x10;
            lsr.execute(cpu, 0x56);
            checkResult(noCarry, cpu.memory[0x11]);
            noCarryResult(cpu, cpu.memory[0x11]);
        });
    });

    describe('absolute', () => {
        it('handles carry and resulting flags', () => {
            cpu.memory[0xC000] = carry;
            cpu.memory[cpu.rPC] = 0x00;
            cpu.memory[cpu.rPC + 1] = 0xC0;
            lsr.execute(cpu, 0x4E);
            checkResult(carry, cpu.memory[0xC000]);
            carryResult(cpu, cpu.memory[0xC000]);
        });

        it('handles no carry and resulting flags', () => {
            cpu.memory[0xC000] = noCarry;
            cpu.memory[cpu.rPC] = 0x00;
            cpu.memory[cpu.rPC + 1] = 0xC0;
            lsr.execute(cpu, 0x4E);
            checkResult(noCarry, cpu.memory[0xC000]);
            noCarryResult(cpu, cpu.memory[0xC000]);
        });
    });

    describe('absolute, x', () => {
        it('handles carry and resulting flags', () => {
            cpu.memory[0xC001] = carry;
            cpu.memory[cpu.rPC] = 0x00;
            cpu.memory[cpu.rPC + 1] = 0xC0;
            cpu.rX = 0x01;
            lsr.execute(cpu, 0x5E);
            checkResult(carry, cpu.memory[0xC001]);
            carryResult(cpu, cpu.memory[0xC001]);
        });

        it('handles no carry and resulting flags', () => {
            cpu.memory[0xC001] = noCarry;
            cpu.memory[cpu.rPC] = 0x00;
            cpu.memory[cpu.rPC + 1] = 0xC0;
            cpu.rX = 0x01;
            lsr.execute(cpu, 0x5E);
            checkResult(noCarry, cpu.memory[0xC001]);
            noCarryResult(cpu, cpu.memory[0xC001]);
        });
    });
});
