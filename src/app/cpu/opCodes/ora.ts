/*
ORA (bitwise OR with Accumulator)

Affects Flags: S Z

MODE           SYNTAX       HEX LEN TIM
Immediate     ORA #$44      $09  2   2
Zero Page     ORA $44       $05  2   3
Zero Page,X   ORA $44,X     $15  2   4
Absolute      ORA $4400     $0D  3   4
Absolute,X    ORA $4400,X   $1D  3   4+
Absolute,Y    ORA $4400,Y   $19  3   4+
Indirect,X    ORA ($44,X)   $01  2   6
Indirect,Y    ORA ($44),Y   $11  2   5+
*/

import { BaseOpCode, OpCodeFamily } from '../opcode.base';
import { IsOpCode } from '../opCodeBridge';
import { OpCodeValue, AddressingModes, Byte, setFlags } from '../globals';
import { ORA } from '../constants';

class OrBase extends BaseOpCode {

    constructor(value: OpCodeValue, mode: AddressingModes, size: Byte) {
        super(ORA, value, mode, size, cpu => {
            let target = cpu.getValue(mode), pc = size - 1;
            cpu.rA |= target;
            cpu.rP = setFlags(cpu.rP, cpu.rA);
            cpu.rPC = cpu.rPC += pc;
        });
    }
}

@IsOpCode
export class OrFamily extends OpCodeFamily {
    constructor() {
        super(ORA);
        super.register(
            new OrBase(0x09, AddressingModes.Immediate, 0x02),
            new OrBase(0x05, AddressingModes.ZeroPage, 0x02),
            new OrBase(0x15, AddressingModes.ZeroPageX, 0x02),
            new OrBase(0x0D, AddressingModes.Absolute, 0x03),
            new OrBase(0x1D, AddressingModes.AbsoluteX, 0x03),
            new OrBase(0x19, AddressingModes.AbsoluteY, 0x03),
            new OrBase(0x01, AddressingModes.IndexedIndirectX, 0x02),
            new OrBase(0x11, AddressingModes.IndirectIndexedY, 0x02)
        );
    }
}