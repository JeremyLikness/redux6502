/*
LSR (Logical Shift Right)

Affects Flags: S Z C

MODE           SYNTAX       HEX LEN TIM
Accumulator   LSR A         $4A  1   2
Zero Page     LSR $44       $46  2   5
Zero Page,X   LSR $44,X     $56  2   6
Absolute      LSR $4400     $4E  3   6
Absolute,X    LSR $4400,X   $5E  3   7
*/

import { AddressingModes, Byte, OpCodeValue, setFlags } from '../globals';
import { LSR, Flags, Memory } from '../constants';
import { IsOpCode } from '../opCodeBridge';
import { BaseOpCode, OpCodeFamily } from '../opcode.base';

class LsrBase extends BaseOpCode {
    constructor(opCode: OpCodeValue, mode: AddressingModes, size: Byte) {
        super(LSR, opCode, mode, size, cpu => {
            const target = mode === AddressingModes.Single ? cpu.rA : cpu.getValue(mode),
                pc = size - 1,
                carry = !!(target & 0x01);
            let result = (target & 0xFE) >> 1;
            if (carry) {
                cpu.rP |= Flags.CarryFlagSet;
            } else {
                cpu.rP &= Flags.CarryFlagReset;
            }
            result &= Memory.ByteMask;
            cpu.rP = setFlags(cpu.rP, result);
            if (mode === AddressingModes.Single) {
                cpu.rA = result;
            } else {
                cpu.memory[cpu.addrForMode(mode)] = result;
            }
            cpu.rPC += pc;
        });
    }
}

@IsOpCode
export class LsrFamily extends OpCodeFamily {
    constructor() {
        super(LSR);
        super.register(
            new LsrBase(0x4A, AddressingModes.Single, 0x01),
            new LsrBase(0x46, AddressingModes.ZeroPage, 0x02),
            new LsrBase(0x56, AddressingModes.ZeroPageX, 0x02),
            new LsrBase(0x4E, AddressingModes.Absolute, 0x03),
            new LsrBase(0x5E, AddressingModes.AbsoluteX, 0x03)
        );
    }
}
