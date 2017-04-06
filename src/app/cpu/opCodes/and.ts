/*
AND (bitwise AND with accumulator)

Affects Flags: S Z

MODE           SYNTAX       HEX LEN TIM
Immediate     AND #$44      $29  2   2
Zero Page     AND $44       $25  2   3
Zero Page,X   AND $44,X     $35  2   4
Absolute      AND $4400     $2D  3   4
Absolute,X    AND $4400,X   $3D  3   4+
Absolute,Y    AND $4400,Y   $39  3   4+
Indirect,X    AND ($44,X)   $21  2   6
Indirect,Y    AND ($44),Y   $31  2   5+
*/

import { BaseOpCode, OpCodeFamily } from '../opcode.base';
import { IsOpCode } from '../opCodeBridge';
import { OpCodeValue, AddressingModes, Byte, setFlags } from '../globals';
import { AND } from '../constants';

class AndBase extends BaseOpCode {

    constructor(value: OpCodeValue, mode: AddressingModes, size: Byte) {
        super(AND, value, mode, size, cpu => {
            const target = cpu.getValue(mode), pc = size - 1;
            cpu.rA &= target;
            cpu.rP = setFlags(cpu.rP, cpu.rA);
            cpu.rPC += pc;
        });
    }
}

@IsOpCode
export class AndFamily extends OpCodeFamily {
    constructor() {
        super(AND);
        super.register(
            new AndBase(0x29, AddressingModes.Immediate, 0x02),
            new AndBase(0x25, AddressingModes.ZeroPage, 0x02),
            new AndBase(0x35, AddressingModes.ZeroPageX, 0x02),
            new AndBase(0x2D, AddressingModes.Absolute, 0x03),
            new AndBase(0x3D, AddressingModes.AbsoluteX, 0x03),
            new AndBase(0x39, AddressingModes.AbsoluteY, 0x03),
            new AndBase(0x21, AddressingModes.IndexedIndirectX, 0x02),
            new AndBase(0x31, AddressingModes.IndirectIndexedY, 0x02)
        );
    }
}
