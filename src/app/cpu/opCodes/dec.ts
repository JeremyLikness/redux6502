/*
DEC (DECrement memory)

Affects Flags: S Z

MODE           SYNTAX       HEX LEN TIM
Zero Page     DEC $44       $C6  2   5
Zero Page,X   DEC $44,X     $D6  2   6
Absolute      DEC $4400     $CE  3   6
Absolute,X    DEC $4400,X   $DE  3   7
*/

import { BaseOpCode, OpCodeFamily } from '../opcode.base';
import { IsOpCode } from '../opCodeBridge';
import { OpCodeValue, AddressingModes, Byte, setFlags } from '../globals';
import { DEC, Memory } from '../constants';

class DecBase extends BaseOpCode {

    constructor(value: OpCodeValue, mode: AddressingModes, size: Byte) {
        super(DEC, value, mode, size, cpu => {
            let addr = cpu.addrForMode(mode), pc = size - 1;
            let temp = (cpu.peek(addr) + 0xFF) & Memory.ByteMask;
            cpu.rP = setFlags(cpu.rP, temp);
            cpu.memory[addr] = temp;
            cpu.rPC += pc;
        });
    }
}

@IsOpCode
export class DecFamily extends OpCodeFamily {
    constructor() {
        super(DEC);
        super.register(
            new DecBase(0xC6, AddressingModes.ZeroPage, 0x02),
            new DecBase(0xD6, AddressingModes.ZeroPageX, 0x02),
            new DecBase(0xCE, AddressingModes.Absolute, 0x03),
            new DecBase(0xDE, AddressingModes.AbsoluteX, 0x03)
        );
    }
}
