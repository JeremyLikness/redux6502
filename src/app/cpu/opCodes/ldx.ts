/*
LDX (LoaD X register)

Affects Flags: S Z

MODE           SYNTAX       HEX LEN TIM
Immediate     LDX #$44      $A2  2   2
Zero Page     LDX $44       $A6  2   3
Zero Page,Y   LDX $44,Y     $B6  2   4
Absolute      LDX $4400     $AE  3   4
Absolute,Y    LDX $4400,Y   $BE  3   4+
*/

import { BaseOpCode, OpCodeFamily } from '../opcode.base';
import { OpCodeValue, AddressingModes, Byte, setFlags } from '../globals';
import { IsOpCode } from '../opCodeBridge';
import { LDX } from '../constants';

class LdxBase extends BaseOpCode {

    constructor(value: OpCodeValue, mode: AddressingModes, size: Byte) {
        super(LDX, value, mode, size, cpu => {
            let target = cpu.getValue(mode), pc = size - 1;
            cpu.rX = target;
            cpu.rP = setFlags(cpu.rP, cpu.rX);
            cpu.rPC += pc;
        });
    }
}

@IsOpCode
export class LdxFamily extends OpCodeFamily {
    constructor() {
        super(LDX);
        super.register(
            new LdxBase(0xA2, AddressingModes.Immediate, 0x02),
            new LdxBase(0x44, AddressingModes.ZeroPage, 0x02),
            new LdxBase(0xB6, AddressingModes.ZeroPageY, 0x02),
            new LdxBase(0xAE, AddressingModes.Absolute, 0x03),
            new LdxBase(0xBE, AddressingModes.AbsoluteY, 0x03)
        );
    }
}
