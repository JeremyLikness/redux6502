/*
ROL (ROtate Left)

Affects Flags: S Z C

MODE           SYNTAX       HEX LEN TIM
Accumulator   ROL A         $2A  1   2
Zero Page     ROL $44       $26  2   5
Zero Page,X   ROL $44,X     $36  2   6
Absolute      ROL $4400     $2E  3   6
Absolute,X    ROL $4400,X   $3E  3   7
*/

import { AddressingModes, Byte, OpCodeValue, setFlags } from '../globals';
import { ROL, Flags, Memory } from '../constants';
import { BaseOpCode, OpCodeFamily } from '../opcode.base';
import { IsOpCode } from '../opCodeBridge';

class RolBase extends BaseOpCode {
    constructor(opCode: OpCodeValue, mode: AddressingModes, size: Byte) {
        super(ROL, opCode, mode, size, cpu => {
            const target = mode === AddressingModes.Single ? cpu.rA : cpu.getValue(mode),
                pc = size - 1,
                carry = (cpu.rP & Flags.CarryFlag) ? 1 : 0;
            let result = (target << 1) + carry;
            if (result >= 0x100) {
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
export class RolFamily extends OpCodeFamily {
    constructor() {
        super(ROL);
        super.register(
            new RolBase(0x2A, AddressingModes.Single, 0x01),
            new RolBase(0x26, AddressingModes.ZeroPage, 0x02),
            new RolBase(0x36, AddressingModes.ZeroPageX, 0x02),
            new RolBase(0x2E, AddressingModes.Absolute, 0x03),
            new RolBase(0x3E, AddressingModes.AbsoluteX, 0x03)
        );
    }
}
