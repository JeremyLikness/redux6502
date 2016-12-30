import { Cpu, initialCpuState } from '../cpuState';
import { Flags, Memory } from '../constants';
import { Byte } from '../globals';

import { TestBed } from '@angular/core/testing';

import { RolFamily } from './rol';

describe('ROL', () => {

    let rol: RolFamily = null;
    let cpu: Cpu = null;
    let noCarry = parseInt('01000000', 2);
    let carry = parseInt('10000000', 2);

    const checkResult = (src: Byte, result: Byte, rotate: boolean) => {
        expect(result).toBe((src * 2 + (rotate ? 1 : 0)) & Memory.ByteMask);
    };

    const carryResult = (proc: Cpu, result: Byte, rotate: boolean) => {
        if (rotate) {
            expect(cpu.rP & Flags.ZeroFlag).toBeFalsy();
        } else {
            expect(cpu.rP & Flags.ZeroFlag).toBeTruthy();
        }
        expect(cpu.rP & Flags.CarryFlag).toBeTruthy();
        expect(cpu.rP & Flags.NegativeFlag).toBeFalsy();
    };

    const noCarryResult = (proc: Cpu, result: Byte) => {
        expect(cpu.rP & Flags.ZeroFlag).toBeFalsy();
        expect(cpu.rP & Flags.CarryFlag).toBeFalsy();
        expect(cpu.rP & Flags.NegativeFlag).toBeTruthy();
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ RolFamily ]
        });

        rol = new RolFamily();
        cpu = initialCpuState();
    });

    describe('accumulator', () => {

        it('handles carry and resulting flags', () => {
            cpu.rA = carry;
            rol.execute(cpu, 0x2A);
            checkResult(carry, cpu.rA, false);
            carryResult(cpu, cpu.rA, false);
        });

        it('handles carry with rotation and resulting flags', () => {
            cpu.rA = carry;
            cpu.rP = Flags.CarryFlagSet;
            rol.execute(cpu, 0x2A);
            checkResult(carry, cpu.rA, true);
            carryResult(cpu, cpu.rA, true);
        });

        it('handles no carry and resulting flags', () => {
            cpu.rA = noCarry;
            rol.execute(cpu, 0x2A);
            checkResult(noCarry, cpu.rA, false);
            noCarryResult(cpu, cpu.rA);
        });

        it('handles no carry with rotation and resulting flags', () => {
            cpu.rA = noCarry;
            cpu.rP = Flags.CarryFlagSet;
            rol.execute(cpu, 0x2A);
            checkResult(noCarry, cpu.rA, true);
            noCarryResult(cpu, cpu.rA);
        });
    });

    describe('zero page', () => {

        it('handles carry and resulting flags', () => {
            cpu.memory[0x10] = carry;
            cpu.memory[cpu.rPC] = 0x10;
            rol.execute(cpu, 0x26);
            checkResult(carry, cpu.memory[0x10], false);
            carryResult(cpu, cpu.memory[0x10], false);
        });

        it('handles carry with rotate and resulting flags', () => {
            cpu.memory[0x10] = carry;
            cpu.memory[cpu.rPC] = 0x10;
            cpu.rP = Flags.CarryFlagSet;
            rol.execute(cpu, 0x26);
            checkResult(carry, cpu.memory[0x10], true);
            carryResult(cpu, cpu.memory[0x10], true);
        });

        it('handles no carry and resulting flags', () => {
            cpu.memory[0x10] = noCarry;
            cpu.memory[cpu.rPC] = 0x10;
            rol.execute(cpu, 0x26);
            checkResult(noCarry, cpu.memory[0x10], false);
            noCarryResult(cpu, cpu.memory[0x10]);
        });

        it('handles no carry with rotation and resulting flags', () => {
            cpu.memory[0x10] = noCarry;
            cpu.memory[cpu.rPC] = 0x10;
            cpu.rP = Flags.CarryFlagSet;
            rol.execute(cpu, 0x26);
            checkResult(noCarry, cpu.memory[0x10], true);
            noCarryResult(cpu, cpu.memory[0x10]);
        });
    });

    describe('zero page, x', () => {
        it('handles carry and resulting flags', () => {
            cpu.memory[0x11] = carry;
            cpu.rX = 0x01;
            cpu.memory[cpu.rPC] = 0x10;
            rol.execute(cpu, 0x36);
            checkResult(carry, cpu.memory[0x11], false);
            carryResult(cpu, cpu.memory[0x11], false);
        });

        it('handles carry with rotation and resulting flags', () => {
            cpu.memory[0x11] = carry;
            cpu.rX = 0x01;
            cpu.memory[cpu.rPC] = 0x10;
            cpu.rP = Flags.CarryFlagSet;
            rol.execute(cpu, 0x36);
            checkResult(carry, cpu.memory[0x11], true);
            carryResult(cpu, cpu.memory[0x11], true);
        });

        it('handles no carry and resulting flags', () => {
            cpu.memory[0x11] = noCarry;
            cpu.rX = 0x01;
            cpu.memory[cpu.rPC] = 0x10;
            rol.execute(cpu, 0x36);
            checkResult(noCarry, cpu.memory[0x11], false);
            noCarryResult(cpu, cpu.memory[0x11]);
        });

        it('handles no carry with rotation and resulting flags', () => {
            cpu.memory[0x11] = noCarry;
            cpu.rX = 0x01;
            cpu.memory[cpu.rPC] = 0x10;
            cpu.rP = Flags.CarryFlagSet;
            rol.execute(cpu, 0x36);
            checkResult(noCarry, cpu.memory[0x11], true);
            noCarryResult(cpu, cpu.memory[0x11]);
        });
    });

    describe('absolute', () => {
        it('handles carry and resulting flags', () => {
            cpu.memory[0xC000] = carry;
            cpu.memory[cpu.rPC] = 0x00;
            cpu.memory[cpu.rPC + 1] = 0xC0;
            rol.execute(cpu, 0x2E);
            checkResult(carry, cpu.memory[0xC000], false);
            carryResult(cpu, cpu.memory[0xC000], false);
        });

        it('handles carry with rotation and resulting flags', () => {
            cpu.memory[0xC000] = carry;
            cpu.memory[cpu.rPC] = 0x00;
            cpu.memory[cpu.rPC + 1] = 0xC0;
            cpu.rP = Flags.CarryFlagSet;
            rol.execute(cpu, 0x2E);
            checkResult(carry, cpu.memory[0xC000], true);
            carryResult(cpu, cpu.memory[0xC000], true);
        });

        it('handles no carry and resulting flags', () => {
            cpu.memory[0xC000] = noCarry;
            cpu.memory[cpu.rPC] = 0x00;
            cpu.memory[cpu.rPC + 1] = 0xC0;
            rol.execute(cpu, 0x2E);
            checkResult(noCarry, cpu.memory[0xC000], false);
            noCarryResult(cpu, cpu.memory[0xC000]);
        });

        it('handles no carry with rotation and resulting flags', () => {
            cpu.memory[0xC000] = noCarry;
            cpu.memory[cpu.rPC] = 0x00;
            cpu.memory[cpu.rPC + 1] = 0xC0;
            cpu.rP = Flags.CarryFlagSet;
            rol.execute(cpu, 0x2E);
            checkResult(noCarry, cpu.memory[0xC000], true);
            noCarryResult(cpu, cpu.memory[0xC000]);
        });
    });

    describe('absolute, x', () => {
        it('handles carry and resulting flags', () => {
            cpu.memory[0xC001] = carry;
            cpu.memory[cpu.rPC] = 0x00;
            cpu.memory[cpu.rPC + 1] = 0xC0;
            cpu.rX = 0x01;
            rol.execute(cpu, 0x3E);
            checkResult(carry, cpu.memory[0xC001], false);
            carryResult(cpu, cpu.memory[0xC001], false);
        });

        it('handles carry with rotation and resulting flags', () => {
            cpu.memory[0xC001] = carry;
            cpu.memory[cpu.rPC] = 0x00;
            cpu.memory[cpu.rPC + 1] = 0xC0;
            cpu.rX = 0x01;
            cpu.rP = Flags.CarryFlagSet;
            rol.execute(cpu, 0x3E);
            checkResult(carry, cpu.memory[0xC001], true);
            carryResult(cpu, cpu.memory[0xC001], true);
        });

        it('handles no carry and resulting flags', () => {
            cpu.memory[0xC001] = noCarry;
            cpu.memory[cpu.rPC] = 0x00;
            cpu.memory[cpu.rPC + 1] = 0xC0;
            cpu.rX = 0x01;
            rol.execute(cpu, 0x3E);
            checkResult(noCarry, cpu.memory[0xC001], false);
            noCarryResult(cpu, cpu.memory[0xC001]);
        });

        it('handles no carry with rotation and resulting flags', () => {
            cpu.memory[0xC001] = noCarry;
            cpu.memory[cpu.rPC] = 0x00;
            cpu.memory[cpu.rPC + 1] = 0xC0;
            cpu.rX = 0x01;
            cpu.rP = Flags.CarryFlagSet;
            rol.execute(cpu, 0x3E);
            checkResult(noCarry, cpu.memory[0xC001], true);
            noCarryResult(cpu, cpu.memory[0xC001]);
        });
    });
});
