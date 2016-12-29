/*
LDY (LoaD Y register)

Affects Flags: S Z

MODE           SYNTAX       HEX LEN TIM
Immediate     LDY #$44      $A0  2   2
Zero Page     LDY $44       $A4  2   3
Zero Page,X   LDY $44,X     $B4  2   4
Absolute      LDY $4400     $AC  3   4
Absolute,X    LDY $4400,X   $BC  3   4+
*/

import { BaseOpCode, OpCodeFamily } from '../opcode.base';
import { IsOpCode } from '../opCodeBridge';
import { OpCodeValue, AddressingModes, Byte, setFlags } from '../globals';
import { LDY } from '../constants';

class LdyBase extends BaseOpCode {

    constructor(value: OpCodeValue, mode: AddressingModes, size: Byte) {
        super(LDY, value, mode, size, cpu => {
            let target = cpu.getValue(mode), pc = size - 1;
            cpu.rY = target;
            cpu.rP = setFlags(cpu.rP, cpu.rY);
            cpu.rPC = cpu.rPC += pc;
        });
    }
}

@IsOpCode
export class LdyFamily extends OpCodeFamily {
    constructor() {
        super(LDY);
        super.register(
            new LdyBase(0xA0, AddressingModes.Immediate, 0x02),
            new LdyBase(0xA4, AddressingModes.ZeroPage, 0x02),
            new LdyBase(0xB4, AddressingModes.ZeroPageX, 0x02),
            new LdyBase(0xAC, AddressingModes.Absolute, 0x03),
            new LdyBase(0xBC, AddressingModes.AbsoluteX, 0x03)
        );
    }
}
