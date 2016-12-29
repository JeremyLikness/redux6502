/*
STX (STore X register)

Affects Flags: none

MODE           SYNTAX       HEX LEN TIM
Zero Page     STX $44       $86  2   3
Zero Page,Y   STX $44,Y     $96  2   4
Absolute      STX $4400     $8E  3   4
*/

import { BaseOpCode, OpCodeFamily } from '../opcode.base';
import { IsOpCode } from '../opCodeBridge';
import { OpCodeValue, AddressingModes, Byte, setFlags, ICpu } from '../globals';
import { STX, Memory } from '../constants';

class StxBase extends BaseOpCode {

    constructor(value: OpCodeValue, mode: AddressingModes, size: Byte) {
        super(STX, value, mode, size, cpu => {
            cpu.memory[cpu.addrForMode(mode)] = cpu.rX;
            cpu.rPC += (size - 1);
        });
    }
}

@IsOpCode
export class StxFamily extends OpCodeFamily {
    constructor() {
        super(STX);
        super.register(
            new StxBase(0x86, AddressingModes.ZeroPage, 0x02),
            new StxBase(0x96, AddressingModes.ZeroPageY, 0x02),
            new StxBase(0x8E, AddressingModes.Absolute, 0x03)
        );
    }
}
