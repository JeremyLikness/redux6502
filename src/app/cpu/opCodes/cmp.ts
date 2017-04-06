/*
CMP (CoMPare accumulator)

Affects Flags: S Z C

MODE           SYNTAX       HEX LEN TIM
Immediate     CMP #$44      $C9  2   2
Zero Page     CMP $44       $C5  2   3
Zero Page,X   CMP $44,X     $D5  2   4
Absolute      CMP $4400     $CD  3   4
Absolute,X    CMP $4400,X   $DD  3   4+
Absolute,Y    CMP $4400,Y   $D9  3   4+
Indirect,X    CMP ($44,X)   $C1  2   6
Indirect,Y    CMP ($44),Y   $D1  2   5+

+ add 1 cycle if page boundary crossed

Compare sets flags as if a subtraction had been carried out. If the value in the accumulator is equal or greater than
the compared value, the Carry will be set. The equal (Z) and sign (S) flags will be set based on equality or lack thereof
and the sign (i.e. A>=$80) of the accumulator.
*/

import { BaseOpCode, OpCodeFamily } from '../opcode.base';
import { IsOpCode } from '../opCodeBridge';
import { OpCodeValue, AddressingModes, Byte, setFlags, compareWithFlag } from '../globals';
import { CMP } from '../constants';

class CmpBase extends BaseOpCode {

    constructor(value: OpCodeValue, mode: AddressingModes, size: Byte) {
        super(CMP, value, mode, size, cpu => {
            const target = cpu.getValue(mode), pc = size - 1;
            cpu.rP = compareWithFlag(cpu.rP, cpu.rA, target);
            cpu.rPC += pc;
        });
    }
}

@IsOpCode
export class CmpFamily extends OpCodeFamily {
    constructor() {
        super(CMP);
        super.register(
            new CmpBase(0xC9, AddressingModes.Immediate, 0x02),
            new CmpBase(0xC5, AddressingModes.ZeroPage, 0x02),
            new CmpBase(0xD5, AddressingModes.ZeroPageX, 0x02),
            new CmpBase(0xCD, AddressingModes.Absolute, 0x03),
            new CmpBase(0xDD, AddressingModes.AbsoluteX, 0x03),
            new CmpBase(0xD9, AddressingModes.AbsoluteY, 0x03),
            new CmpBase(0xC1, AddressingModes.IndexedIndirectX, 0x02),
            new CmpBase(0xD1, AddressingModes.IndirectIndexedY, 0x02)
        );
    }
}
