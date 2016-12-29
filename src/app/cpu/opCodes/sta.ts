/*
STA (STore Accumulator)

Affects Flags: none

MODE           SYNTAX       HEX LEN TIM
Zero Page     STA $44       $85  2   3
Zero Page,X   STA $44,X     $95  2   4
Absolute      STA $4400     $8D  3   4
Absolute,X    STA $4400,X   $9D  3   5
Absolute,Y    STA $4400,Y   $99  3   5
Indirect,X    STA ($44,X)   $81  2   6
Indirect,Y    STA ($44),Y   $91  2   6
*/

import { BaseOpCode, OpCodeFamily } from '../opcode.base';
import { IsOpCode } from '../opCodeBridge';
import { OpCodeValue, AddressingModes, Byte, setFlags, ICpu } from '../globals';
import { STA, Memory } from '../constants';

class StaBase extends BaseOpCode {

    constructor(value: OpCodeValue, mode: AddressingModes, size: Byte) {
        super(STA, value, mode, size, cpu => {
            cpu.memory[cpu.addrForMode(mode)] = cpu.rA;
            cpu.rPC += (size - 1);
        });
    }
}

@IsOpCode
export class StaFamily extends OpCodeFamily {
    constructor() {
        super(STA);
        super.register(
            new StaBase(0x85, AddressingModes.ZeroPage, 0x02),
            new StaBase(0x95, AddressingModes.ZeroPageX, 0x02),
            new StaBase(0x8D, AddressingModes.Absolute, 0x03),
            new StaBase(0x9D, AddressingModes.AbsoluteX, 0x03),
            new StaBase(0x99, AddressingModes.AbsoluteY, 0x03),
            new StaBase(0x81, AddressingModes.IndexedIndirectX, 0x02),
            new StaBase(0x91, AddressingModes.IndirectIndexedY, 0x02)
        );
    }
}
