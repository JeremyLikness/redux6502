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
import { LDX } from '../constants';

export class LdxBase extends BaseOpCode {

    constructor(value: OpCodeValue, mode: AddressingModes, size: Byte) {
        super(LDX, value, mode, size, cpu => {
            let target = cpu.getValue(mode), pc = size - 1;
            cpu.rX = target;
            cpu.rP = setFlags(cpu.rP, cpu.rX);
            cpu.rPC = cpu.rPC += pc;
        });
    }
}

class LdxImmediate extends LdxBase {
    constructor() {
        super(0xA2, AddressingModes.Immediate, 0x02);
    }
}

class LdxZeroPage extends LdxBase {
    constructor() {
        super(0x44, AddressingModes.ZeroPage, 0x02);
    }
}

class LdxZeroPageY extends LdxBase {
    constructor() {
        super(0xB6, AddressingModes.ZeroPageY, 0x02);
    }
}

class LdxAbsolute extends LdxBase {
    constructor() {
        super(0xAE, AddressingModes.Absolute, 0x03);
    }
}

class LdxAbsoluteY extends LdxBase {
    constructor() {
        super(0xBE, AddressingModes.AbsoluteY, 0x03);
    }
}

export class LdxFamily extends OpCodeFamily {
    constructor() {
        super(LDX);
        super.register(
            new LdxImmediate(),
            new LdxZeroPage(),
            new LdxZeroPageY(),
            new LdxAbsolute(),
            new LdxAbsoluteY()
        );
    }
}
