/*
SBC (SuBtract with Carry)

Affects Flags: S V Z C

MODE           SYNTAX       HEX LEN TIM
Immediate     SBC #$44      $E9  2   2
Zero Page     SBC $44       $E5  2   3
Zero Page,X   SBC $44,X     $F5  2   4
Absolute      SBC $4400     $ED  3   4
Absolute,X    SBC $4400,X   $FD  3   4+
Absolute,Y    SBC $4400,Y   $F9  3   4+
Indirect,X    SBC ($44,X)   $E1  2   6
Indirect,Y    SBC ($44),Y   $F1  2   5+

+ add 1 cycle if page boundary crossed

SBC results are dependant on the setting of the decimal flag. In decimal mode, subtraction is carried out on the assumption 
that the values involved are packed BCD (Binary Coded Decimal).
There is no way to subtract without the carry which works as an inverse borrow. i.e, to subtract you set the carry before 
the operation. If the carry is cleared by the operation, it indicates a borrow occurred.
*/

import { BaseOpCode, OpCodeFamily } from '../opcode.base';
import { IsOpCode } from '../opCodeBridge';
import { OpCodeValue, AddressingModes, Byte, setFlags, subtractWithCarry } from '../globals';
import { SBC } from '../constants';

class SbcBase extends BaseOpCode {

    constructor(value: OpCodeValue, mode: AddressingModes, size: Byte) {
        super(SBC, value, mode, size, cpu => {
            let target = cpu.getValue(mode), pc = size - 1,
                result = subtractWithCarry(cpu.rP, cpu.rA, target);
            cpu.rA = result.result;
            cpu.rP = result.flag;
            cpu.rPC += pc;
        });
    }
}

@IsOpCode
export class SbcFamily extends OpCodeFamily {
    constructor() {
        super(SBC);
        super.register(
            new SbcBase(0xE9, AddressingModes.Immediate, 0x02),
            new SbcBase(0xE5, AddressingModes.ZeroPage, 0x02),
            new SbcBase(0xF5, AddressingModes.ZeroPageX, 0x02),
            new SbcBase(0xED, AddressingModes.Absolute, 0x03),
            new SbcBase(0xFD, AddressingModes.AbsoluteX, 0x03),
            new SbcBase(0xF9, AddressingModes.AbsoluteY, 0x03),
            new SbcBase(0xE1, AddressingModes.IndexedIndirectX, 0x02),
            new SbcBase(0xF1, AddressingModes.IndirectIndexedY, 0x02)
        );
    }
}