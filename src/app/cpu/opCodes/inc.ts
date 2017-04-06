/*
INC (INCrement memory)

Affects Flags: S Z

MODE           SYNTAX       HEX LEN TIM
Zero Page     INC $44       $E6  2   5
Zero Page,X   INC $44,X     $F6  2   6
Absolute      INC $4400     $EE  3   6
Absolute,X    INC $4400,X   $FE  3   7
*/

import { BaseOpCode, OpCodeFamily } from '../opcode.base';
import { IsOpCode } from '../opCodeBridge';
import { OpCodeValue, AddressingModes, Byte, setFlags } from '../globals';
import { INC, Memory } from '../constants';

class IncBase extends BaseOpCode {

    constructor(value: OpCodeValue, mode: AddressingModes, size: Byte) {
        super(INC, value, mode, size, cpu => {
            const addr = cpu.addrForMode(mode), pc = size - 1;
            const temp = (cpu.peek(addr) + 1) & Memory.ByteMask;
            cpu.rP = setFlags(cpu.rP, temp);
            cpu.memory[addr] = temp;
            cpu.rPC += pc;
        });
    }
}

@IsOpCode
export class IncFamily extends OpCodeFamily {
    constructor() {
        super(INC);
        super.register(
            new IncBase(0xE6, AddressingModes.ZeroPage, 0x02),
            new IncBase(0xF6, AddressingModes.ZeroPageX, 0x02),
            new IncBase(0xEE, AddressingModes.Absolute, 0x03),
            new IncBase(0xFE, AddressingModes.AbsoluteX, 0x03)
        );
    }
}
