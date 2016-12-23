export type Byte = number; // 8 bits 
export type Word = number; // 16 bits low/high
export type Address = Word; // memory address 
export type ZeroPage = Byte; // zero page memory address
export type Register = number; // CPU Register 
export type RAM = number[]; // memory
export type OpCodeValue = number; // op code byte
export type Flag = number; // holds a flag 

import { Memory, Flags } from './constants';

export enum AddressingModes {
    Immediate, // LDA #$00
    ZeroPage, // LDA $00
    ZeroPageX, // LDA $00,X 
    ZeroPageY, // LDX $00,Y
    Absolute, // LDA $C000
    AbsoluteX, // LDA $C000,X
    AbsoluteY, // LDA $C000,Y 
    Indirect, // JMP ($C000)
    IndexedIndirectX, // LDA ($00,X)
    IndirectIndexedY, // LDA ($00), Y
    Single, // TXS
    Relative // BEQ $C000
}

export interface ICpu {

    debug: boolean; // true when in debug mode

    rA: Register & Byte; // A accumulator
    rX: Register & Byte; // X register
    rY: Register & Byte; // Y register
    rP: Register & Byte; // Program Status Flags (S=sign, V=Overflow, 1, B=BRK, D=Decimal, I=Interrupt Disabled, Z=Zero, C=Carry)
    rPC: Address & Word; // Program Counter
    rSP: Address & Word; // Stack Pointer

    cycles: number;

    memory: RAM;

    checkFlag: (flag: Flag) => boolean;
    peek: (address: Address) => Byte;
    setFlag: (originalFlag: Flag, flag: Flag, setAction?) => Flag;
    addrPop: (offset?: Byte) => Byte;
    addrPopWord: () => Word;
    addrAbsoluteX: () => Address;
    addrAbsoluteY: () => Address;
    addrIndirect: () => Address;
    addrIndexedIndirectX: () => Address;
    addrIndirectIndexedY: () => Address;
    addrZeroPageX: () => Address;
    addrZeroPageY: () => ZeroPage;
    getValue: (mode: AddressingModes) => Byte;
}

export interface IOpCode {
    name: string;
    value: OpCodeValue;
    mode: AddressingModes;
    size: Byte;
    execute: (cpu: ICpu) => void;
}

export interface IOpCodes {
    name: string;
    execute: (cpu: ICpu, opCode: OpCodeValue) => void;
    register: (...ops: IOpCode[]) => void;
    codes: OpCodeValue[];
}

export const setFlags = (flags: Flag, value: Byte) => {
    let newFlags: Flag = flags;

    if (value & Flags.NegativeFlagSet) {
        newFlags |= Flags.NegativeFlagSet;
    } else {
        newFlags &= Flags.NegativeFlagReset;
    }

    if (value === 0) {
        newFlags |= Flags.ZeroFlagSet;
    } else {
        newFlags &= Flags.ZeroFlagReset;
    }

    return newFlags;
};

export const poke = (cpu: ICpu, startAddress: Address, bytes: Byte[]) => {
    for (let offset = 0; offset < bytes.length; offset += 1) {
        let address: Address = (startAddress + offset) & Memory.Max;
        cpu.memory[address] = bytes[offset] & Memory.ByteMask;
    }
};

export const computeBranch = (address: Address, offset: Byte) => {
    let result = 0;
    if (offset > Memory.BranchBack) {
        result = (address - (Memory.BranchOffset - offset));
    } else {
        result = address + offset;
    }
    return result;
};
