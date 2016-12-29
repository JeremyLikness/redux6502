import { Cpu, initialCpuState } from '../cpuState';

import { Flags } from '../constants';

import { TestBed } from '@angular/core/testing';

import { StackFamily } from './stack';

describe('registers', () => {

    let stack: StackFamily = null;
    let cpu: Cpu = null;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ StackFamily ]
        });

        stack = new StackFamily();
        cpu = initialCpuState();

    });

    describe('TXS', () => {

        it('should transfer the x register to the stack pointer', () => {
            cpu.rX = 0x7F;
            stack.execute(cpu, 0x9A);
            expect(cpu.rSP).toBe(0x7F);
        });

    });

    describe('TSX', () => {
        it('should transfer the stack pointer to the x register', () => {
            cpu.rSP = 0x7F;
            stack.execute(cpu, 0xBA);
            expect(cpu.rX).toBe(0x7F);
        });

        it('should set the sign flag', () => {
            cpu.rSP = 0x80;
            stack.execute(cpu, 0xBA);
            expect(cpu.rP & Flags.NegativeFlag).toBeTruthy();
        });

        it('should set the zero flag', () => {
            cpu.rSP = 0x00;
            stack.execute(cpu, 0xBA);
            expect(cpu.rP & Flags.ZeroFlag).toBeTruthy();
        });

        it('should reset the sign flag', () => {
            cpu.rSP = 0x7F;
            cpu.rP = Flags.NegativeFlagSet;
            stack.execute(cpu, 0xBA);
            expect(cpu.rP & Flags.NegativeFlag).toBeFalsy();
        });

        it('should reset the zero flag', () => {
            cpu.rSP = 0x01;
            cpu.rP = Flags.ZeroFlagSet;
            stack.execute(cpu, 0xBA);
            expect(cpu.rP & Flags.ZeroFlag).toBeFalsy();
        });
    });

    describe('PHA', () => {
        it('should push the accumulator onto the stack', () => {
            cpu.rA = 0x88;
            stack.execute(cpu, 0x48);
            expect(cpu.stackPop()).toBe(0x88);
        });
    });

    describe('PLA', () => {
        it('should pull the accumulator from the stack', () => {
            cpu.stackPush(0xEE);
            stack.execute(cpu, 0x68);
            expect(cpu.rA).toBe(0xEE);
        });

        it('should set the sign flag', () => {
            cpu.stackPush(0x80);
            stack.execute(cpu, 0x68);
            expect(cpu.rP & Flags.NegativeFlag).toBeTruthy();
        });

        it('should set the zero flag', () => {
            cpu.stackPush(0x00);
            stack.execute(cpu, 0x68);
            expect(cpu.rP & Flags.ZeroFlag).toBeTruthy();
        });

        it('should reset the sign flag', () => {
            cpu.stackPush(0x7F);
            cpu.rP = Flags.NegativeFlagSet;
            stack.execute(cpu, 0x68);
            expect(cpu.rP & Flags.NegativeFlag).toBeFalsy();
        });

        it('should reset the zero flag', () => {
            cpu.stackPush(0x01);
            cpu.rP = Flags.ZeroFlagSet;
            stack.execute(cpu, 0x68);
            expect(cpu.rP & Flags.ZeroFlag).toBeFalsy();
        });
    });

    describe('PHP', () => {

        it('should push the processor status to the stack', () => {
            cpu.rP = Flags.ZeroFlagSet | Flags.CarryFlagSet;
            stack.execute(cpu, 0x08);
            expect(cpu.stackPop()).toBe(Flags.ZeroFlagSet | Flags.CarryFlagSet);
        });

    });

    describe('PLP', () => {

        it('should pull the processor status from the stack', () => {
            cpu.stackPush(Flags.OverflowFlagSet | Flags.NegativeFlagSet);
            stack.execute(cpu, 0x28);
            expect(cpu.rP & Flags.OverflowFlag).toBeTruthy();
            expect(cpu.rP & Flags.NegativeFlag).toBeTruthy();
        });
    });
});
