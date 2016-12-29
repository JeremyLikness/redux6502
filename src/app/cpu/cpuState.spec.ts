/* tslint:disable:no-unused-variable */

import { TestBed, async } from '@angular/core/testing';

import { Memory, Flags } from './constants';

import { Cpu, initialCpuState, cloneCpu } from './cpuState';

import {
    Address,
    Byte,
    AddressingModes,
    poke,
    setFlags,
    computeBranch
} from './globals';

const freeze = (cpu: Cpu) => {
    Object.freeze(cpu);
    Object.freeze(cpu.memory);
    Object.freeze(cpu.stats);
    Object.freeze(cpu.controls);
};

describe('initialCpuState', () => {

    let cpu: Cpu = null;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ initialCpuState ]
        });
    });

    cpu = initialCpuState();

    it('should initialize the CPU', () => {
        expect(cpu.rA).toBe(0);
        expect(cpu.rX).toBe(0);
        expect(cpu.rY).toBe(0);
        expect(cpu.rP).toBe(0);
        expect(cpu.rPC).toBe(Memory.DefaultStart);
        expect(cpu.rSP).toBe(Memory.Stack);
        expect(cpu.memory.length).toBe(Memory.Size);
        expect(cpu.memory).toEqual(Array(Memory.Size).fill(0x00));
    });

});

describe('poke', () => {

    let cpu: Cpu = null;

    beforeEach(() => {
        TestBed.configureTestingModule({ declarations: [ poke ]});
        cpu = initialCpuState();
    });

    it('should poke the value', () => {
        poke(cpu, 0xC000, [0x7F]);
        expect(cpu.memory[0xC000]).toBe(0x7F);
    });

    it('should force 8-bits', () => {
        poke(cpu, 0xC000, [0x101]);
        expect(cpu.memory[0xC000]).toBe(0x01);
    });

    it('should handle multiple bytes', () => {
        poke(cpu, 0xC000, [0x7F, 0x8E]);
        expect(cpu.memory[0xC000]).toBe(0x7F);
        expect(cpu.memory[0xC001]).toBe(0x8E);
    });

    it('should limit to appropriate addresses', () => {
        poke(cpu, 0xFFFF, [0x7F, 0x8E]);
        expect(cpu.memory[0xFFFF]).toBe(0x7F);
        expect(cpu.memory[0x0]).toBe(0x8E);
    });
});

describe('setFlags', () => {

    beforeEach(() => {
        TestBed.configureTestingModule({ declarations: [ setFlags ]});
    });

    it('should set the negative flag when high bit value set', () => {
        let result = setFlags(Flags.InitialState, 0x80);
        expect(result & Flags.NegativeFlag).toBeTruthy();
    });

    it('should reset the negative flag when high bit value not set', () => {
        let result = setFlags(0xFF & Flags.ZeroFlagReset, 0x7F);
        expect(result & Flags.NegativeFlag).toBeFalsy();
    });

    it('should set the zero flag when value is zero', () => {
        let result = setFlags(Flags.InitialState, 0x00);
        expect(result & Flags.ZeroFlag).toBeTruthy();
    });

    it('should reset the zero flag when value is not zero', () => {
        let result = setFlags(0xFF & Flags.NegativeFlagReset, 0x01);
        expect(result & Flags.ZeroFlag).toBeFalsy();
    });
});

describe('cloneCpu', () => {

    let cpu: Cpu = null;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ initialCpuState ]
        });

        cpu = initialCpuState();
        cpu.rA = 1;
        cpu.memory[1] = 2;
        cpu.stats.started = new Date();
        cpu.controls.errorState = true;
    });

    it('should clone the cpu', () => {
        Object.freeze(cpu);
        let newCpu = cloneCpu(cpu);
        newCpu.rX = 22; // change something to prove it is a copy
        expect(newCpu.rA).toBe(1);
    });

    it('should clone the memory', () => {
        Object.freeze(cpu.memory);
        Object.freeze(cpu);
        let newCpu = cloneCpu(cpu);
        newCpu.memory[2] = 3; // change something to prove it a copy
        expect(newCpu.memory[1]).toBe(2);
    });

    it('should clone the stats', () => {
        Object.freeze(cpu.stats);
        Object.freeze(cpu);
        let newCpu = cloneCpu(cpu);
        newCpu.stats.ellapsedMilliseconds = 22;
        expect(newCpu.stats.started).toEqual(cpu.stats.started);
    });

    it('should clone the controls', () => {
        Object.freeze(cpu.controls);
        Object.freeze(cpu);
        let newCpu = cloneCpu(cpu);
        newCpu.controls.autoRefresh = true;
        expect(newCpu.controls.errorState).toBe(true);
    });
});

describe('operations', () => {

    let cpu: Cpu = null;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ initialCpuState ]
        });

        cpu = initialCpuState();
    });

    describe('execute', () => {

        it('should throw error for invalid op code', () => {
            expect(() => cpu.execute()).toThrow();
        });

        it('should run the op code and advance the program counter', () => {
            let pc = cpu.rPC;
            cpu.memory[cpu.rPC] = 0xA9; // LDA immediate 
            cpu.memory[cpu.rPC + 1] = 0x7F; // LDA #$7F 
            cpu.execute();
            expect(cpu.rPC).toBe(pc + 0x02);
            expect(cpu.rA).toBe(0x7F);
        });

        it('should throw an exception if the program counter rolls past end of memory', () => {
            cpu.rPC = Memory.Max;
            cpu.memory[Memory.Max] = 0xA9; // LDA immediate 
            expect(() => cpu.execute()).toThrow();
        });
    });

    describe('checkFlag', () => {

        it('should return true when flag is set', () => {
            expect(cpu.checkFlag(Flags.CarryFlag)).toBe(false);
            expect(cpu.checkFlag(Flags.ZeroFlag)).toBe(false);
        });

        it('should return flag when flag is reset', () => {
            cpu.rP = Flags.CarryFlagSet;
            expect(cpu.checkFlag(Flags.CarryFlag)).toBe(true);
            expect(cpu.checkFlag(Flags.ZeroFlag)).toBe(false);
        });
    });

    describe('setFlag', () => {

        it('should set the flag when setAction is true', () => {
            let newFlag = cpu.setFlag(0x0, Flags.CarryFlag);
            expect(newFlag).toBe(Flags.CarryFlagSet);
        });

        it('should reset the flag when setAction is false', () => {
            let newFlag = cpu.setFlag(Memory.ByteMask, Flags.CarryFlag, false);
            expect(newFlag).toBe(Flags.CarryFlagReset);
        });
    });

    describe('peek', () => {

        beforeEach(() => {
            cpu.memory[5] = 6;
            cpu.memory[6] = 257;
            freeze(cpu);
        });

        it('should get the value at the address', () => {
            expect(cpu.peek(5)).toBe(6);
        });

        it('should return a value less than 255', () => {
            expect(cpu.peek(6)).toBe(1);
        });

        it('should handle address overflows', () => {
            expect(cpu.peek(Memory.Size + 5)).toBe(6);
        });
    });

    // C000: 80 => 80
    describe('addrPop', () => {
        it('returns the value at the program counter', () => {
            cpu.memory[2] = 3;
            cpu.rPC = 2;
            freeze(cpu);
            expect(cpu.addrPop()).toBe(3);
        });
    });

    // 02: 03 04 => 0403
    describe('addrPopWord', () => {
        it('returns the word (2 bytes) at the program counter', () => {
            cpu.memory[2] = 3;
            cpu.memory[3] = 4;
            cpu.rPC = 2;
            freeze(cpu);
            expect(cpu.addrPopWord()).toBe(4 * (Memory.ByteMask + 1) + 3);
        });
    });

    // C000 0x20 = C000 + 20 = C020 
    // C000 0x82 = C000 - (100 - 82) = C000 - 7E = BF82
    describe('computeBranch', () => {
        it('computes an address forward when offset less than 128', () => {
            expect(computeBranch(0xC000, 0x20)).toBe(0xC020);
        });
        it('computes an address backwards when offset greater than 127', () => {
            expect(computeBranch(0xC000, 0x82)).toBe(0xBF82);
        });
    });

    // 00: 00 C0 RX: 10 => C010
    describe('addrAbsoluteX', () => {
        it('offsets the address at the current memory location by the X register amount', () => {
            cpu.memory[0] = 0x00;
            cpu.memory[1] = 0xC0;
            cpu.rX = 0x10;
            cpu.rPC = 0;
            freeze(cpu);
            expect(cpu.addrAbsoluteX()).toBe(0xC010);
        });
    });

    // 00: 00 C0 RY: 10 => C010
    describe('addrAbsoluteY', () => {
        it('offsets the address at the current memory location by the Y register amount', () => {
            cpu.memory[0] = 0x00;
            cpu.memory[1] = 0xC0;
            cpu.rY = 0x10;
            cpu.rPC = 0;
            freeze(cpu);
            expect(cpu.addrAbsoluteY()).toBe(0xC010);
        });
    });

    // 200: 00 C0 => C000: 20 D0 => D020 
    describe('addrIndirect', () => {
        it('uses the memory location to lookup a separate memory location to compute the new location', () => {
            cpu.memory[0x200] = 0x00;
            cpu.memory[0x201] = 0xC0;
            cpu.memory[0xC000] = 0x20;
            cpu.memory[0xC001] = 0xD0;
            cpu.rPC = 0x200;
            freeze(cpu);
            expect(cpu.addrIndirect()).toBe(0xD020);
        });
        it('does not carrry when on a page boundary to compute the new location', () => {
            cpu.memory[0x200] = 0xFF;
            cpu.memory[0x201] = 0xC0;
            cpu.memory[0xC000] = 0xAA;
            cpu.memory[0xC0FF] = 0x21;
            cpu.memory[0xC100] = 0xBB;
            cpu.rPC = 0x200;
            freeze(cpu);
            expect(cpu.addrIndirect()).toBe(0xAA21);
        });
    });

    // C000: 02 RX: 02 => 04: 20 D0 => D020 
    describe('addrIndexedIndirectX', () => {
        it('uses a zero page address offset by the X register to compute the new location', () => {
            cpu.memory[0xc000] = 0x02;
            cpu.memory[0x04] = 0x20;
            cpu.memory[0x05] = 0xD0;
            cpu.rX = 0x02;
            cpu.rPC = 0xc000;
            freeze(cpu);
            expect(cpu.addrIndexedIndirectX()).toBe(0xD020);
        });
    });

    // 00: 02 02: 00 C0 RY: 10 => C010 
    describe('addrIndirectIndexedY', () => {
        it('uses the address to get a zero page, computes an offset from the zero page, then adds the Y register offset', () => {
            cpu.memory[0x00] = 0x02;
            cpu.memory[0x02] = 0x00;
            cpu.memory[0x03] = 0xC0;
            cpu.rPC = 0x00;
            cpu.rY = 0x10;
            freeze(cpu);
            expect(cpu.addrIndirectIndexedY()).toBe(0xC010);
        });
    });

    // 00: 80 RX: 10 => 0x90 
    describe('addrZeroPageX', () => {
        it('uses the address to find a zero page, then offsets it by the X register', () => {
            cpu.memory[0x00] = 0x80;
            cpu.rPC = 0;
            cpu.rX = 0x10;
            freeze(cpu);
            expect(cpu.addrZeroPageX()).toBe(0x90);
        });
    });

    // 00: 80 RY: 10 => 0x90
    describe('addrZeroPageY', () => {
        it('uses the address to find a zero page, then offsets it by the Y register', () => {
            cpu.memory[0x00] = 0x80;
            cpu.rPC = 0;
            cpu.rY = 0x10;
            freeze(cpu);
            expect(cpu.addrZeroPageY()).toBe(0x90);
        });
    });

    // RAM: C000: 01 02 03 04 05 06 07 08 09 0A 0B 0C 
    // RAM: 2000: 00 C0 00 10 01 10 00
    // RAM: 05: 03 C0 FF 
    // RAM: 10: 03 C0 
    // REGISTERS: RX: 0x05 RY: 0x06 
    // Address setup: 
    // Absolute: 2000: 00 C0 => 01 
    // AbsoluteX: 2000: 00 C0 => 06 
    // AbsoluteY: 2000: 00 C0 => 07 
    // Immediate: C00B => 0C 
    // IndexedIndirectX: 2002 => 04
    // IndirectIndexedY: 2003 => 0A
    // ZeroPageX: 2004 => C0 
    // ZeroPageY: 2004 => FF
    // Indirect: 2005 => 0010 => C003 => 04

    interface IGetValueTest {
        pc: Address;
        mode: AddressingModes;
        expected: Byte;
        description: string;
    }

    let tests: IGetValueTest[] = [ {
        pc: 0x2000,
        mode: AddressingModes.Absolute,
        expected: 0x01,
        description: 'returns the value at the absolute address for absolute address mode'
    }, {
        pc: 0x2000,
        mode: AddressingModes.AbsoluteX,
        expected: 0x06,
        description: 'returns the value at the absolute address offset by register X for absolute X address mode'
    }, {
        pc: 0x2000,
        mode: AddressingModes.AbsoluteY,
        expected: 0x07,
        description: 'returns the value at the absolute address offset by register Y for absolute Y address mode'
    }, {
        pc: 0xC00B,
        mode: AddressingModes.Immediate,
        expected: 0x0C,
        description: 'returns the value at the program counter for immediate mode'
    }, {
        pc: 0x2002,
        mode: AddressingModes.IndexedIndirectX,
        expected: 0x04,
        description: 'returns the value based on the zero page at the program counter, adding register X, then reading an address' +
        ' for indexed indirect X mode'
    }, {
        pc: 0x2003,
        mode: AddressingModes.IndirectIndexedY,
        expected: 0x0A,
        description: 'returns the value based on the zero page at the program counter, reading an address, then adding register Y' +
        ' for indirect indexed Y mode'
    }, {
        pc: 0x2004,
        mode: AddressingModes.ZeroPageX,
        expected: 0xC0,
        description: 'returns the value based on the zero page at the program counter, then adding register X for zero page X mode'
    }, {
        pc: 0x2004,
        mode: AddressingModes.ZeroPageY,
        expected: 0xFF,
        description: 'returns the value based on the zero page at the program counter, then adding register Y for zero page Y mode'
    }, {
        pc: 0x2003,
        mode: AddressingModes.ZeroPage,
        expected: 0x03,
        description: 'returns the value based on the zero page at the program counter for zero page mode'
    }, {
        pc: 0x2005,
        mode: AddressingModes.Indirect,
        expected: 0x04,
        description: 'returns the value based using the program counter to get an address, then reading the address from that location'
    }];

    describe('getValue', () => {

        beforeEach(() => {
            cpu.memory[0x05] = 0x03;
            cpu.memory[0x06] = 0xC0;
            cpu.memory[0x07] = 0xFF;
            cpu.memory[0x10] = 0x03;
            cpu.memory[0x11] = 0xC0;
            cpu.memory[0x2000] = 0x00;
            cpu.memory[0x2001] = 0xC0;
            cpu.memory[0x2002] = 0x00;
            cpu.memory[0x2003] = 0x10;
            cpu.memory[0x2004] = 0x01;
            cpu.memory[0x2005] = 0x10;
            cpu.memory[0x2006] = 0x00;
            let addr = 0xC000;
            for (let val = 0x01; val <= 0x0C; val += 1) {
                cpu.memory[addr] = val;
                addr += 1;
            }
            cpu.rX = 0x05;
            cpu.rY = 0x06;
        });

        tests.forEach(test => {
            it(test.description, () => {
                cpu.rPC = test.pc;
                freeze(cpu);
                expect(cpu.getValue(test.mode)).toBe(test.expected);
            });
        });
    });

    describe('stackPush', () => {

        it ('adds the value to the stack', () => {
            let stackPosition = cpu.rSP - 1;
            cpu.stackPush(0x7F);
            expect(cpu.memory[stackPosition + Memory.Stack]).toBe(0x7F);
        });

        it ('reduces the stack pointer', () => {
            let stackPosition = cpu.rSP - 1;
            cpu.stackPush(0x7F);
            expect(cpu.rSP).toBe(stackPosition);
        });

        it ('enforces an 8-bit value', () => {
            let stackPosition = cpu.rSP - 1;
            cpu.stackPush(0x17F);
            expect(cpu.memory[stackPosition + Memory.Stack]).toBe(0x7F);
        });

        it ('throws when the stack is full', () => {
            cpu.rSP = -1;
            expect(() => cpu.stackPush(0x7F)).toThrow();
        });
    });

    describe('stackPop', () => {
        it ('returns the last value pushed to the stack', () => {
            cpu.stackPush(0x7F);
            expect(cpu.stackPop()).toBe(0x7F);
        });

        it('advances the stack pointer', () => {
            cpu.stackPush(0x7F);
            let pointer = cpu.rSP + 1;
            cpu.stackPop();
            expect(cpu.rSP).toBe(pointer);
        });

        it('throws when the stack is empty', () => {
            expect(() => cpu.stackPop()).toThrow();
        });
    });

});
