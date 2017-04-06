import { Cpu, initialCpuState, cloneCpu } from '../cpuState';
import { Flags } from '../constants';

import { TestBed } from '@angular/core/testing';

import { BitFamily, testBit } from './bit';

describe('BIT', () => {

    let bit: BitFamily = null;
    let cpu: Cpu = null;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [BitFamily]
        });

        bit = new BitFamily();
        cpu = initialCpuState();
        cpu.memory[cpu.rPC] = 0x44;
        cpu.memory[cpu.rPC + 1] = 0xC0;
        cpu.rA = parseInt('00000010', 2);
    });

    describe('testBit', () => {
        it('should set the zero flag when AND results in 0', () => {
            const result = testBit(0x0, 0x0, 0x03);
            expect(result & Flags.ZeroFlag).toBeTruthy();
        });

        it('should reset the zero flag when AND does not result in zero', () => {
            const result = testBit(0xFF, 0x01, 0x03);
            expect(result & Flags.ZeroFlag).toBeFalsy();
        });

        it('should set the negative flag if bit 7 of the target is set', () => {
            const result = testBit(0x0, 0x01, Flags.NegativeFlagSet);
            expect(result & Flags.NegativeFlag).toBeTruthy();
        });

        it('should reset the negative flag if bit 7 of the target is not set', () => {
            const result = testBit(0xFF, 0x01, 0x01);
            expect(result & Flags.NegativeFlag).toBeFalsy();
        });

        it('should set the overflow flag if bit 6 of the target is set', () => {
            const result = testBit(0x0, 0x01, Flags.OverflowFlagSet);
            expect(result & Flags.OverflowFlag).toBeTruthy();
        });

        it('should reset the overflow flag if bit 6 of the target is not set', () => {
            const result = testBit(0xFF, 0x01, 0x01);
            expect(result & Flags.OverflowFlag).toBeFalsy();
        });
    });

    describe('zero page', () => {

        it('tests against the correct memory address', () => {
            cpu.memory[0x44] = parseInt('11000110', 2);
            bit.execute(cpu, 0x24);
            expect(cpu.rP & Flags.ZeroFlag).toBeFalsy();
            expect(cpu.rP & Flags.NegativeFlag).toBeTruthy();
            expect(cpu.rP & Flags.OverflowFlag).toBeTruthy();
        });

    });

    describe('absolute', () => {

        it('tests against the correct memory address', () => {
            cpu.memory[0xC044] = parseInt('11000110', 2);
            bit.execute(cpu, 0x2C);
            expect(cpu.rP & Flags.ZeroFlag).toBeFalsy();
            expect(cpu.rP & Flags.NegativeFlag).toBeTruthy();
            expect(cpu.rP & Flags.OverflowFlag).toBeTruthy();
        });

    });

});
