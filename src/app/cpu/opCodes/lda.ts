/*
LDA (LoaD Accumulator)

Affects Flags: S Z

MODE           SYNTAX       HEX LEN TIM
Immediate     LDA #$44      $A9  2   2
Zero Page     LDA $44       $A5  2   3
Zero Page,X   LDA $44,X     $B5  2   4
Absolute      LDA $4400     $AD  3   4
Absolute,X    LDA $4400,X   $BD  3   4+
Absolute,Y    LDA $4400,Y   $B9  3   4+
Indirect,X    LDA ($44,X)   $A1  2   6
Indirect,Y    LDA ($44),Y   $B1  2   5+
*/

import { BaseOpCode, OpCodeFamily } from '../opcode.base';
import { IsOpCode } from '../opCodeBridge';
import { OpCodeValue, AddressingModes, Byte, setFlags } from '../globals';
import { LDA } from '../constants';

class LdaBase extends BaseOpCode {

    constructor(value: OpCodeValue, mode: AddressingModes, size: Byte) {
        super(LDA, value, mode, size, cpu => {
            let target = cpu.getValue(mode), pc = size - 1;
            cpu.rA = target;
            cpu.rP = setFlags(cpu.rP, cpu.rA);
            cpu.rPC += pc;
        });
    }
}

@IsOpCode
export class LdaFamily extends OpCodeFamily {
    constructor() {
        super(LDA);
        super.register(
            new LdaBase(0xA9, AddressingModes.Immediate, 0x02),
            new LdaBase(0xA5, AddressingModes.ZeroPage, 0x02),
            new LdaBase(0xB5, AddressingModes.ZeroPageX, 0x02),
            new LdaBase(0xAD, AddressingModes.Absolute, 0x03),
            new LdaBase(0xBD, AddressingModes.AbsoluteX, 0x03),
            new LdaBase(0xB9, AddressingModes.AbsoluteY, 0x03),
            new LdaBase(0xA1, AddressingModes.IndexedIndirectX, 0x02),
            new LdaBase(0xB1, AddressingModes.IndirectIndexedY, 0x02)
        );
    }
}
