import { Cpu, initialCpuState, cloneCpu } from '../cpuState';

import { Flag, OpCodeValue, Address } from '../globals';

import { Flags } from '../constants';

import { TestBed } from '@angular/core/testing';

import { BranchFamily as BranchOps } from './branches';

interface IBranchTest {
    opCode: OpCodeValue;
    flag: Flag;
    set: boolean;
    test: string;
    PC: Address;
}

let testBranches: IBranchTest[] = [{
    opCode: 0x10,
    flag: Flags.NegativeFlagSet,
    set: true,
    PC: 0xC002,
    test: 'BPL advances PC when negative flag set'
}, {
    opCode: 0x10,
    flag: Flags.NegativeFlagReset,
    set: false,
    PC: 0xC022,
    test: 'BPL branches when negative flag is not set'
}, {
    opCode: 0x30,
    flag: Flags.NegativeFlagSet,
    set: true,
    PC: 0xC022,
    test: 'BMI branches when negative flag set'
}, {
    opCode: 0x30,
    flag: Flags.NegativeFlagReset,
    set: false,
    PC: 0xC002,
    test: 'BPL advances PC when negative flag is not set'
}, {
    opCode: 0x50,
    flag: Flags.OverflowFlagSet,
    set: true,
    PC: 0xC002,
    test: 'BVC advances PC when overflow flag set'
}, {
    opCode: 0x50,
    flag: Flags.OverflowFlagReset,
    set: false,
    PC: 0xC022,
    test: 'BVC branches when overflow flag is not set'
}, {
    opCode: 0x70,
    flag: Flags.OverflowFlagSet,
    set: true,
    PC: 0xC022,
    test: 'BVS branches when overflow flag set'
}, {
    opCode: 0x70,
    flag: Flags.OverflowFlagReset,
    set: false,
    PC: 0xC002,
    test: 'BVS advances PC when overflow flag is not set'
}, {
    opCode: 0x90,
    flag: Flags.CarryFlagSet,
    set: true,
    PC: 0xC002,
    test: 'BCC advances PC when carry flag set'
}, {
    opCode: 0x90,
    flag: Flags.CarryFlagReset,
    set: false,
    PC: 0xC022,
    test: 'BCC branches when carry flag is not set'
}, {
    opCode: 0xB0,
    flag: Flags.CarryFlagSet,
    set: true,
    PC: 0xC022,
    test: 'BCS branches when carry flag set'
}, {
    opCode: 0xB0,
    flag: Flags.CarryFlagReset,
    set: false,
    PC: 0xC002,
    test: 'BCS advances PC when carry flag is not set'
},  {
    opCode: 0xD0,
    flag: Flags.ZeroFlagSet,
    set: true,
    PC: 0xC002,
    test: 'BNE advances PC when zero flag set'
}, {
    opCode: 0xD0,
    flag: Flags.ZeroFlagReset,
    set: false,
    PC: 0xC022,
    test: 'BNE branches when zero flag is not set'
}, {
    opCode: 0xF0,
    flag: Flags.ZeroFlagSet,
    set: true,
    PC: 0xC022,
    test: 'BEQ branches when zero flag set'
}, {
    opCode: 0xF0,
    flag: Flags.ZeroFlagReset,
    set: false,
    PC: 0xC002,
    test: 'BEQ advances PC when zero flag is not set'
}];

describe('branches', () => {

    let branchOps: BranchOps = null;
    let cpu: Cpu = null;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ BranchOps ]
        });

        branchOps = new BranchOps();
        cpu = initialCpuState();
        cpu.rPC = 0xC001;
        cpu.memory[0xC001] = 0x20;
    });

    it('handles a backwards branch', () => {
        cpu.memory[0xC001] = 0xFE; // back 2
        branchOps.execute(cpu, 0xD0);
        expect(cpu.rPC).toBe(0xBFFE);
    });

    testBranches.forEach(test => {
        it(test.test, () => {
            if (test.set) {
                cpu.rP |= test.flag;
            }
            branchOps.execute(cpu, test.opCode);
            expect(cpu.rPC).toBe(test.PC);
        });
    });
});
