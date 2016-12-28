/*
NOP (No OPeration)

Affects Flags: none

MODE           SYNTAX       HEX LEN TIM
Implied       NOP           $EA  1   2

NOP is used to reserve space for future modifications or effectively REM out existing code.
*/

import { BaseOpCode, OpCodeFamily } from '../opcode.base';
import { IsOpCode } from '../opCodeBridge';
import { AddressingModes } from '../globals';
import { NOP } from '../constants';

export class Nop extends BaseOpCode {

    constructor() {
        super(NOP, 0xEA, AddressingModes.Single, 0x01, cpu => {});
    }
}

@IsOpCode
export class NopFamily extends OpCodeFamily {
    constructor() {
        super(NOP);
        super.register(new Nop());
    }
}
