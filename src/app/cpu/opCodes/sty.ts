/*
STY (STore Y register)

Affects Flags: none

MODE           SYNTAX       HEX LEN TIM
Zero Page     STY $44       $84  2   3
Zero Page,X   STY $44,X     $94  2   4
Absolute      STY $4400     $8C  3   4
*/

import { BaseOpCode, OpCodeFamily } from '../opcode.base';
import { IsOpCode } from '../opCodeBridge';
import { OpCodeValue, AddressingModes, Byte, setFlags, ICpu } from '../globals';
import { STY, Memory } from '../constants';

class StyBase extends BaseOpCode {

    constructor(value: OpCodeValue, mode: AddressingModes, size: Byte) {
        super(STY, value, mode, size, cpu => {
            cpu.memory[cpu.addrForMode(mode)] = cpu.rY;
            cpu.rPC += (size - 1);
        });
    }
}

@IsOpCode
export class StyFamily extends OpCodeFamily {
    constructor() {
        super(STY);
        super.register(
            new StyBase(0x84, AddressingModes.ZeroPage, 0x02),
            new StyBase(0x94, AddressingModes.ZeroPageX, 0x02),
            new StyBase(0x8C, AddressingModes.Absolute, 0x03)
        );
    }
}
