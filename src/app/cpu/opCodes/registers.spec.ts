import { Cpu, initialCpuState } from '../cpuState';

import { Flags } from '../constants';

import { TestBed } from '@angular/core/testing';

import { RegisterFamily } from './registers';

describe('registers', () => {

    let register: RegisterFamily = null;
    let cpu: Cpu = null;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [RegisterFamily]
        });

        register = new RegisterFamily();
        cpu = initialCpuState();

    });

    describe('TAX', () => {

        const TAXCode = 0xAA;

        it('should transfer the accumulator to the x register', () => {
            cpu.rA = 0x7F;
            register.execute(cpu, TAXCode);
            expect(cpu.rX).toBe(cpu.rA);
        });

        it('should set the sign flag', () => {
            cpu.rA = Flags.NegativeFlag;
            register.execute(cpu, TAXCode);
            expect(cpu.rP & Flags.NegativeFlag).toBeTruthy();
        });

        it('should set the zero flag', () => {
            cpu.rA = 0x00;
            register.execute(cpu, TAXCode);
            expect(cpu.rP & Flags.ZeroFlag).toBeTruthy();
        });
    });

    describe('TXA', () => {

        const TXACode = 0x8A;

        it('should transfer the x register to the accumulator', () => {
            cpu.rX = 0x7F;
            register.execute(cpu, TXACode);
            expect(cpu.rA).toBe(cpu.rX);
        });

        it('should set the sign flag', () => {
            cpu.rX = Flags.NegativeFlag;
            register.execute(cpu, TXACode);
            expect(cpu.rP & Flags.NegativeFlag).toBeTruthy();
        });

        it('should set the zero flag', () => {
            cpu.rX = 0x00;
            register.execute(cpu, TXACode);
            expect(cpu.rP & Flags.ZeroFlag).toBeTruthy();
        });
    });

    describe('DEX', () => {

        const DEXCode = 0xCA;

        it('should decrement the X register', () => {
            cpu.rX = 0x7F;
            register.execute(cpu, DEXCode);
            expect(cpu.rX).toBe(0x7E);
        });

        it('should decrement from 0 to 0xFF', () => {
            cpu.rX = 0;
            register.execute(cpu, DEXCode);
            expect(cpu.rX).toBe(0xFF);
        });

        it('should set the sign flag', () => {
            cpu.rX = Flags.NegativeFlag + 1;
            register.execute(cpu, DEXCode);
            expect(cpu.rP & Flags.NegativeFlag).toBeTruthy();
        });

        it('should set the zero flag', () => {
            cpu.rX = 0x01;
            register.execute(cpu, DEXCode);
            expect(cpu.rP & Flags.ZeroFlag).toBeTruthy();
        });
    });

    describe('INX', () => {

        const INXCode = 0xE8;

        it('should increment the X register', () => {
            cpu.rX = 0x00;
            register.execute(cpu, INXCode);
            expect(cpu.rX).toBe(0x01);
        });

        it('should increment from 0xFF to 0', () => {
            cpu.rX = 0xFF;
            register.execute(cpu, INXCode);
            expect(cpu.rX).toBe(0x00);
        });

        it('should set the sign flag', () => {
            cpu.rX = Flags.NegativeFlag - 1;
            register.execute(cpu, INXCode);
            expect(cpu.rP & Flags.NegativeFlag).toBeTruthy();
        });

        it('should set the zero flag', () => {
            cpu.rX = 0xFF;
            register.execute(cpu, INXCode);
            expect(cpu.rP & Flags.ZeroFlag).toBeTruthy();
        });
    });

    describe('TAY', () => {

        const TAYCode = 0xA8;

        it('should transfer the accumulator to the y register', () => {
            cpu.rA = 0x7F;
            register.execute(cpu, TAYCode);
            expect(cpu.rY).toBe(cpu.rA);
        });

        it('should set the sign flag', () => {
            cpu.rA = Flags.NegativeFlag;
            register.execute(cpu, TAYCode);
            expect(cpu.rP & Flags.NegativeFlag).toBeTruthy();
        });

        it('should set the zero flag', () => {
            cpu.rA = 0x00;
            register.execute(cpu, TAYCode);
            expect(cpu.rP & Flags.ZeroFlag).toBeTruthy();
        });
    });

    describe('TYA', () => {

        const TYACode = 0x98;

        it('should transfer the y register to the accumulator', () => {
            cpu.rY = 0x7F;
            register.execute(cpu, TYACode);
            expect(cpu.rA).toBe(cpu.rY);
        });

        it('should set the sign flag', () => {
            cpu.rY = Flags.NegativeFlag;
            register.execute(cpu, TYACode);
            expect(cpu.rP & Flags.NegativeFlag).toBeTruthy();
        });

        it('should set the zero flag', () => {
            cpu.rY = 0x00;
            register.execute(cpu, TYACode);
            expect(cpu.rP & Flags.ZeroFlag).toBeTruthy();
        });
    });

    describe('DEY', () => {

        const DEYCode = 0x88;

        it('should decrement the Y register', () => {
            cpu.rY = 0x7F;
            register.execute(cpu, DEYCode);
            expect(cpu.rY).toBe(0x7E);
        });

        it('should decrement from 0 to 0xFF', () => {
            cpu.rY = 0;
            register.execute(cpu, DEYCode);
            expect(cpu.rY).toBe(0xFF);
        });

        it('should set the sign flag', () => {
            cpu.rY = Flags.NegativeFlag + 1;
            register.execute(cpu, DEYCode);
            expect(cpu.rP & Flags.NegativeFlag).toBeTruthy();
        });

        it('should set the zero flag', () => {
            cpu.rY = 0x01;
            register.execute(cpu, DEYCode);
            expect(cpu.rP & Flags.ZeroFlag).toBeTruthy();
        });
    });

    describe('INY', () => {

        const INYCode = 0xC8;

        it('should increment the y register', () => {
            cpu.rY = 0x00;
            register.execute(cpu, INYCode);
            expect(cpu.rY).toBe(0x01);
        });

        it('should increment from 0xFF to 0', () => {
            cpu.rY = 0xFF;
            register.execute(cpu, INYCode);
            expect(cpu.rY).toBe(0x00);
        });

        it('should set the sign flag', () => {
            cpu.rY = Flags.NegativeFlag - 1;
            register.execute(cpu, INYCode);
            expect(cpu.rP & Flags.NegativeFlag).toBeTruthy();
        });

        it('should set the zero flag', () => {
            cpu.rY = 0xFF;
            register.execute(cpu, INYCode);
            expect(cpu.rP & Flags.ZeroFlag).toBeTruthy();
        });
    });
});
