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
    execute: () => void;
    fetch: (opCode: OpCodeValue) => IOpCode;
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
    stackPush: (value: Byte) => void;
    stackPop: () => Byte;
    addrForMode: (mode: AddressingModes) => Word;
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
    fetch: (cpu: ICpu, opCode: OpCodeValue) => IOpCode;
}

export const hexHelper = (val: Byte | Word, digits = 2) => {
    const leading = Array(digits).fill('0').join('');
    return (leading + val.toString(16).toLocaleUpperCase())
        .substr(-1 * digits);
};

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

export const compareWithFlag = (flag: Flag, registerValue: Byte, value: Byte) => {
    const offset = Memory.ByteMask + registerValue - value + 1;

    if (offset >= 0x100) {
        flag |= Flags.CarryFlagSet;
    } else {
        flag &= Flags.CarryFlagReset;
    }

    const temp = offset & Memory.ByteMask;

    if (temp & Flags.NegativeFlag) {
        flag |= Flags.NegativeFlagSet;
    } else {
        flag &= Flags.NegativeFlagReset;
    }

    if (temp === 0) {
        flag |= Flags.ZeroFlagSet;
    } else {
        flag &= Flags.ZeroFlagReset;
    }

    return flag;
};

export const poke = (cpu: ICpu, startAddress: Address, bytes: Byte[]) => {
    for (let offset = 0; offset < bytes.length; offset += 1) {
        const address: Address = (startAddress + offset) & Memory.Max;
        cpu.memory[address] = bytes[offset] & Memory.ByteMask;
    }
};

export const computeBranch = (addressOfBranchOp: Address, offset: Byte) => {
    let result = 0;
    if (offset > Memory.BranchBack) {
        result = (addressOfBranchOp + 0x02 - (Memory.BranchOffset - offset));
    } else {
        result = addressOfBranchOp + offset + 0x02;
    }
    return result;
};

export interface IAddWithCarryResult {
    flag: Flag;
    result: Byte;
}

export const toDecimal = (result: Byte) => ((result & Memory.HighNibbleMask) >> Memory.BitsInNibble) * 10 + (result & Memory.NibbleMask);

export const toHex = (input: Byte) => ((input / 10) << Memory.BitsInNibble) + input % 10;

export const addWithCarry = (flag: Flag, accumulator: Byte, target: Byte) => {

    const carry = flag & Flags.CarryFlag ? 1 : 0;

    if (flag & Flags.DecimalFlag) {
        const a = toDecimal(accumulator), t = toDecimal(target);
        let r = a + t + carry;
        if (r >= 100) {
            flag |= Flags.CarryFlagSet;
            r -= 100;
        } else {
            flag &= Flags.CarryFlagReset;
        }
        flag = setFlags(flag, r);
        return {
            flag,
            result: toHex(r)
        } as IAddWithCarryResult;
    }

    const temp = accumulator + target + carry;

    if (((accumulator ^ temp) & (target ^ temp) & Flags.NegativeFlagSet) === Flags.NegativeFlag) {
        flag |= Flags.OverflowFlagSet;
    } else {
        flag &= Flags.OverflowFlagReset;
    }

    if ((temp & 0x100) === 0x100) {
        flag |= Flags.CarryFlagSet;
    } else {
        flag &= Flags.CarryFlagReset;
    }

    flag = setFlags(flag, temp);

    return {
        flag: flag,
        result: temp & Memory.ByteMask
    } as IAddWithCarryResult;
};

export const subtractWithCarry = (flag: Flag, accumulator: Byte, target: Byte) => {

    let offset = 0,
        temp = 0;
    const carryFactor = flag & Flags.CarryFlag ? 1 : 0,
        offsetAdjustSub = (offs: number) => {
            if (offs < 0x100) {
                flag &= Flags.CarryFlagReset;
                if (flag & Flags.OverflowFlag && offs < Flags.NegativeFlagSet) {
                    flag &= Flags.OverflowFlagReset;
                }
                return true;
            } else {
                flag |= Flags.CarryFlagSet;
                if (flag & Flags.OverflowFlag && offset >= 0x180) {
                    flag &= Flags.OverflowFlagReset;
                }
            }
            return false;
        };

    if (!!((accumulator ^ target) & Flags.NegativeFlag)) {
        flag |= Flags.OverflowFlagSet;
    } else {
        flag &= Flags.OverflowFlagReset;
    }

    if (flag & Flags.DecimalFlag) {
        temp = Memory.NibbleMask + (accumulator & Memory.NibbleMask) - (target & Memory.NibbleMask) + carryFactor;
        if (temp < 0x10) {
            offset = 0;
            temp -= 0x06;
        } else {
            offset = 0x10;
            temp -= 0x10;
        }
        offset += Memory.HighNibbleMask + (accumulator & Memory.HighNibbleMask) - (target & Memory.HighNibbleMask);
        if (offsetAdjustSub(offset)) {
            offset -= 0x60;
        }
        offset += temp;
    } else {
        offset = Memory.ByteMask + accumulator - target + carryFactor;
        offsetAdjustSub(offset);
    }
    const result = offset & Memory.ByteMask;
    flag = setFlags(flag, result);
    return {
        flag,
        result
    } as IAddWithCarryResult;
};
