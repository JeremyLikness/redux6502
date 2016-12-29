/*
EOR (bitwise Exclusive OR)

Affects Flags: S Z

MODE           SYNTAX       HEX LEN TIM
Immediate     EOR #$44      $49  2   2
Zero Page     EOR $44       $45  2   3
Zero Page,X   EOR $44,X     $55  2   4
Absolute      EOR $4400     $4D  3   4
Absolute,X    EOR $4400,X   $5D  3   4+
Absolute,Y    EOR $4400,Y   $59  3   4+
Indirect,X    EOR ($44,X)   $41  2   6
Indirect,Y    EOR ($44),Y   $51  2   5+
*/

import { BaseOpCode, OpCodeFamily } from '../opcode.base';
import { IsOpCode } from '../opCodeBridge';
import { OpCodeValue, AddressingModes, Byte, setFlags } from '../globals';
import { EOR } from '../constants';

class XorBase extends BaseOpCode {

    constructor(value: OpCodeValue, mode: AddressingModes, size: Byte) {
        super(EOR, value, mode, size, cpu => {
            let target = cpu.getValue(mode), pc = size - 1;
            cpu.rA ^= target;
            cpu.rP = setFlags(cpu.rP, cpu.rA);
            cpu.rPC = cpu.rPC += pc;
        });
    }
}

@IsOpCode
export class XorFamily extends OpCodeFamily {
    constructor() {
        super(EOR);
        super.register(
            new XorBase(0x49, AddressingModes.Immediate, 0x02),
            new XorBase(0x45, AddressingModes.ZeroPage, 0x02),
            new XorBase(0x55, AddressingModes.ZeroPageX, 0x02),
            new XorBase(0x4D, AddressingModes.Absolute, 0x03),
            new XorBase(0x5D, AddressingModes.AbsoluteX, 0x03),
            new XorBase(0x59, AddressingModes.AbsoluteY, 0x03),
            new XorBase(0x41, AddressingModes.IndexedIndirectX, 0x02),
            new XorBase(0x51, AddressingModes.IndirectIndexedY, 0x02)
        );
    }
}