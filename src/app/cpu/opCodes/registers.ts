/*
Register Instructions

Affect Flags: S Z

These instructions are implied mode, have a length of one byte and require two machine cycles.

MNEMONIC                 HEX
TAX (Transfer A to X)    $AA
TXA (Transfer X to A)    $8A
DEX (DEcrement X)        $CA
INX (INcrement X)        $E8
TAY (Transfer A to Y)    $A8
TYA (Transfer Y to A)    $98
DEY (DEcrement Y)        $88
INY (INcrement Y)        $C8
*/

import { BaseOpCode, OpCodeFamily } from '../opcode.base';
import { IsOpCode } from '../opCodeBridge';
import { AddressingModes, setFlags, ICpu, OpCodeValue } from '../globals';
import { REGISTERS, TAX, TXA, DEX, INX, TAY, TYA, DEY, INY, Memory } from '../constants';

class RegisterOpCode extends BaseOpCode {
    constructor(name: string, opCode: OpCodeValue, execute: (cpu: ICpu) => void) {
        super(name, opCode, AddressingModes.Single, 0x01, execute);
    }
}

@IsOpCode
export class RegisterFamily extends OpCodeFamily {
    constructor() {
        super(REGISTERS);
        super.register(
            new RegisterOpCode(TAX, 0xAA, cpu => {
                cpu.rX = cpu.rA;
                cpu.rP = setFlags(cpu.rP, cpu.rX);
            }),
            new RegisterOpCode(TXA, 0x8A, cpu => {
                cpu.rA = cpu.rX;
                cpu.rP = setFlags(cpu.rP, cpu.rA);
            }),
            new RegisterOpCode(DEX, 0xCA, cpu => {
                cpu.rX = (cpu.rX + 0xFF) & Memory.ByteMask;
                cpu.rP = setFlags(cpu.rP, cpu.rX);
            }),
            new RegisterOpCode(INX, 0xE8, cpu => {
                cpu.rX = (cpu.rX + 0x01) & Memory.ByteMask;
                cpu.rP = setFlags(cpu.rP, cpu.rX);
            }),
            new RegisterOpCode(TAY, 0xA8, cpu => {
                cpu.rY = cpu.rA;
                cpu.rP = setFlags(cpu.rP, cpu.rY);
            }),
            new RegisterOpCode(TYA, 0x98, cpu => {
                cpu.rA = cpu.rY;
                cpu.rP = setFlags(cpu.rP, cpu.rA);
            }),
            new RegisterOpCode(DEY, 0x88, cpu => {
                cpu.rY = (cpu.rY + 0xFF) & Memory.ByteMask;
                cpu.rP = setFlags(cpu.rP, cpu.rY);
            }),
            new RegisterOpCode(INY, 0xC8, cpu => {
                cpu.rY = (cpu.rY + 0x01) & Memory.ByteMask;
                cpu.rP = setFlags(cpu.rP, cpu.rY);
            })
        );
    }
}
