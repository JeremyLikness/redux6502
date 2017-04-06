/*
ROR (ROtate Right)

Affects Flags: S Z C

MODE           SYNTAX       HEX LEN TIM
Accumulator   ROR A         $6A  1   2
Zero Page     ROR $44       $66  2   5
Zero Page,X   ROR $44,X     $76  2   6
Absolute      ROR $4400     $6E  3   6
Absolute,X    ROR $4400,X   $7E  3   7
*/

import { AddressingModes, Byte, OpCodeValue, setFlags } from '../globals';
import { ROR, Flags, Memory } from '../constants';
import { BaseOpCode, OpCodeFamily } from '../opcode.base';
import { IsOpCode } from '../opCodeBridge';

class RorBase extends BaseOpCode {
    constructor(opCode: OpCodeValue, mode: AddressingModes, size: Byte) {
        super(ROR, opCode, mode, size, cpu => {
            const target = mode === AddressingModes.Single ? cpu.rA : cpu.getValue(mode),
                pc = size - 1,
                carry = (cpu.rP & Flags.CarryFlag) ? 0x80 : 0,
                rotate = target & 0x01;
            let result: Byte = ((target & 0xFE) >> 1) + carry;
            if (rotate) {
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
export class RorFamily extends OpCodeFamily {
    constructor() {
        super(ROR);
        super.register(
            new RorBase(0x6A, AddressingModes.Single, 0x01),
            new RorBase(0x66, AddressingModes.ZeroPage, 0x02),
            new RorBase(0x76, AddressingModes.ZeroPageX, 0x02),
            new RorBase(0x6E, AddressingModes.Absolute, 0x03),
            new RorBase(0x7E, AddressingModes.AbsoluteX, 0x03)
        );
    }
}
