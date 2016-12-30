import { Cpu, initialCpuState } from '../cpuState';
import { Flags, Memory } from '../constants';
import { Byte } from '../globals';

import { TestBed } from '@angular/core/testing';

import { RorFamily } from './ror';

describe('ROR', () => {

    let ror: RorFamily = null;
    let cpu: Cpu = null;
    let noCarry = parseInt('00000010', 2);
    let carry = parseInt('00000001', 2);

    const checkResult = (src: Byte, result: Byte, rotate: boolean) => {
        expect(result).toBe((src / 2 + (rotate ? 0x80 : 0)) & Memory.ByteMask);
    };

    const carryResult = (proc: Cpu, result: Byte, rotate: boolean) => {
        if (rotate) {
            expect(cpu.rP & Flags.ZeroFlag).toBeFalsy();
        } else {
            expect(cpu.rP & Flags.ZeroFlag).toBeTruthy();
        }
        expect(cpu.rP & Flags.CarryFlag).toBeTruthy();
        if (rotate) {
            expect(cpu.rP & Flags.NegativeFlag).toBeTruthy();
        } else {
            expect(cpu.rP & Flags.NegativeFlag).toBeFalsy();
        }
    };

    const noCarryResult = (proc: Cpu, result: Byte, rotate: boolean) => {
        expect(cpu.rP & Flags.ZeroFlag).toBeFalsy();
        expect(cpu.rP & Flags.CarryFlag).toBeFalsy();
        if (rotate) {
            expect(cpu.rP & Flags.NegativeFlag).toBeTruthy();
        } else {
            expect(cpu.rP & Flags.NegativeFlag).toBeFalsy();
        }
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ RorFamily ]
        });

        ror = new RorFamily();
        cpu = initialCpuState();
    });

    describe('accumulator', () => {

        it('handles carry and resulting flags', () => {
            cpu.rA = carry;
            ror.execute(cpu, 0x6A);
            checkResult(carry, cpu.rA, false);
            carryResult(cpu, cpu.rA, false);
        });

        it('handles carry with rotation and resulting flags', () => {
            cpu.rA = carry;
            cpu.rP = Flags.CarryFlagSet;
            ror.execute(cpu, 0x6A);
            checkResult(carry, cpu.rA, true);
            carryResult(cpu, cpu.rA, true);
        });

        it('handles no carry and resulting flags', () => {
            cpu.rA = noCarry;
            ror.execute(cpu, 0x6A);
            checkResult(noCarry, cpu.rA, false);
            noCarryResult(cpu, cpu.rA, false);
        });

        it('handles no carry with rotation and resulting flags', () => {
            cpu.rA = noCarry;
            cpu.rP = Flags.CarryFlagSet;
            ror.execute(cpu, 0x6A);
            checkResult(noCarry, cpu.rA, true);
            noCarryResult(cpu, cpu.rA, true);
        });
    });

    describe('zero page', () => {

        it('handles carry and resulting flags', () => {
            cpu.memory[0x10] = carry;
            cpu.memory[cpu.rPC] = 0x10;
            ror.execute(cpu, 0x66);
            checkResult(carry, cpu.memory[0x10], false);
            carryResult(cpu, cpu.memory[0x10], false);
        });

        it('handles carry with rotate and resulting flags', () => {
            cpu.memory[0x10] = carry;
            cpu.memory[cpu.rPC] = 0x10;
            cpu.rP = Flags.CarryFlagSet;
            ror.execute(cpu, 0x66);
            checkResult(carry, cpu.memory[0x10], true);
            carryResult(cpu, cpu.memory[0x10], true);
        });

        it('handles no carry and resulting flags', () => {
            cpu.memory[0x10] = noCarry;
            cpu.memory[cpu.rPC] = 0x10;
            ror.execute(cpu, 0x66);
            checkResult(noCarry, cpu.memory[0x10], false);
            noCarryResult(cpu, cpu.memory[0x10], false);
        });

        it('handles no carry with rotation and resulting flags', () => {
            cpu.memory[0x10] = noCarry;
            cpu.memory[cpu.rPC] = 0x10;
            cpu.rP = Flags.CarryFlagSet;
            ror.execute(cpu, 0x66);
            checkResult(noCarry, cpu.memory[0x10], true);
            noCarryResult(cpu, cpu.memory[0x10], true);
        });
    });

    describe('zero page, x', () => {
        it('handles carry and resulting flags', () => {
            cpu.memory[0x11] = carry;
            cpu.rX = 0x01;
            cpu.memory[cpu.rPC] = 0x10;
            ror.execute(cpu, 0x76);
            checkResult(carry, cpu.memory[0x11], false);
            carryResult(cpu, cpu.memory[0x11], false);
        });

        it('handles carry with rotation and resulting flags', () => {
            cpu.memory[0x11] = carry;
            cpu.rX = 0x01;
            cpu.memory[cpu.rPC] = 0x10;
            cpu.rP = Flags.CarryFlagSet;
            ror.execute(cpu, 0x76);
            checkResult(carry, cpu.memory[0x11], true);
            carryResult(cpu, cpu.memory[0x11], true);
        });

        it('handles no carry and resulting flags', () => {
            cpu.memory[0x11] = noCarry;
            cpu.rX = 0x01;
            cpu.memory[cpu.rPC] = 0x10;
            ror.execute(cpu, 0x76);
            checkResult(noCarry, cpu.memory[0x11], false);
            noCarryResult(cpu, cpu.memory[0x11], false);
        });

        it('handles no carry with rotation and resulting flags', () => {
            cpu.memory[0x11] = noCarry;
            cpu.rX = 0x01;
            cpu.memory[cpu.rPC] = 0x10;
            cpu.rP = Flags.CarryFlagSet;
            ror.execute(cpu, 0x76);
            checkResult(noCarry, cpu.memory[0x11], true);
            noCarryResult(cpu, cpu.memory[0x11], true);
        });
    });

    describe('absolute', () => {
        it('handles carry and resulting flags', () => {
            cpu.memory[0xC000] = carry;
            cpu.memory[cpu.rPC] = 0x00;
            cpu.memory[cpu.rPC + 1] = 0xC0;
            ror.execute(cpu, 0x6E);
            checkResult(carry, cpu.memory[0xC000], false);
            carryResult(cpu, cpu.memory[0xC000], false);
        });

        it('handles carry with rotation and resulting flags', () => {
            cpu.memory[0xC000] = carry;
            cpu.memory[cpu.rPC] = 0x00;
            cpu.memory[cpu.rPC + 1] = 0xC0;
            cpu.rP = Flags.CarryFlagSet;
            ror.execute(cpu, 0x6E);
            checkResult(carry, cpu.memory[0xC000], true);
            carryResult(cpu, cpu.memory[0xC000], true);
        });

        it('handles no carry and resulting flags', () => {
            cpu.memory[0xC000] = noCarry;
            cpu.memory[cpu.rPC] = 0x00;
            cpu.memory[cpu.rPC + 1] = 0xC0;
            ror.execute(cpu, 0x6E);
            checkResult(noCarry, cpu.memory[0xC000], false);
            noCarryResult(cpu, cpu.memory[0xC000], false);
        });

        it('handles no carry with rotation and resulting flags', () => {
            cpu.memory[0xC000] = noCarry;
            cpu.memory[cpu.rPC] = 0x00;
            cpu.memory[cpu.rPC + 1] = 0xC0;
            cpu.rP = Flags.CarryFlagSet;
            ror.execute(cpu, 0x6E);
            checkResult(noCarry, cpu.memory[0xC000], true);
            noCarryResult(cpu, cpu.memory[0xC000], true);
        });
    });

    describe('absolute, x', () => {
        it('handles carry and resulting flags', () => {
            cpu.memory[0xC001] = carry;
            cpu.memory[cpu.rPC] = 0x00;
            cpu.memory[cpu.rPC + 1] = 0xC0;
            cpu.rX = 0x01;
            ror.execute(cpu, 0x7E);
            checkResult(carry, cpu.memory[0xC001], false);
            carryResult(cpu, cpu.memory[0xC001], false);
        });

        it('handles carry with rotation and resulting flags', () => {
            cpu.memory[0xC001] = carry;
            cpu.memory[cpu.rPC] = 0x00;
            cpu.memory[cpu.rPC + 1] = 0xC0;
            cpu.rX = 0x01;
            cpu.rP = Flags.CarryFlagSet;
            ror.execute(cpu, 0x7E);
            checkResult(carry, cpu.memory[0xC001], true);
            carryResult(cpu, cpu.memory[0xC001], true);
        });

        it('handles no carry and resulting flags', () => {
            cpu.memory[0xC001] = noCarry;
            cpu.memory[cpu.rPC] = 0x00;
            cpu.memory[cpu.rPC + 1] = 0xC0;
            cpu.rX = 0x01;
            ror.execute(cpu, 0x7E);
            checkResult(noCarry, cpu.memory[0xC001], false);
            noCarryResult(cpu, cpu.memory[0xC001], false);
        });

        it('handles no carry with rotation and resulting flags', () => {
            cpu.memory[0xC001] = noCarry;
            cpu.memory[cpu.rPC] = 0x00;
            cpu.memory[cpu.rPC + 1] = 0xC0;
            cpu.rX = 0x01;
            cpu.rP = Flags.CarryFlagSet;
            ror.execute(cpu, 0x7E);
            checkResult(noCarry, cpu.memory[0xC001], true);
            noCarryResult(cpu, cpu.memory[0xC001], true);
        });
    });
});
