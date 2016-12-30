/*

ASL (Arithmetic Shift Left)

Affects Flags: S Z C

MODE           SYNTAX       HEX LEN TIM
Accumulator   ASL A         $0A  1   2
Zero Page     ASL $44       $06  2   5
Zero Page,X   ASL $44,X     $16  2   6
Absolute      ASL $4400     $0E  3   6
Absolute,X    ASL $4400,X   $1E  3   7

ASL shifts all bits left one position. 0 is shifted into bit 0 and the original bit 7 is shifted into the Carry.
*/

import { AddressingModes, Byte, OpCodeValue, setFlags } from '../globals';
import { ASL, Flags, Memory } from '../constants';
import { BaseOpCode, OpCodeFamily } from '../opcode.base';

class AslBase extends BaseOpCode {
    constructor(opCode: OpCodeValue, mode: AddressingModes, size: Byte) {
        super(ASL, opCode, mode, size, cpu => {
            let target = mode === AddressingModes.Single ? cpu.rA : cpu.getValue(mode),
                pc = size - 1,
                result = target << 1;
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

export class AslFamily extends OpCodeFamily {
    constructor() {
        super(ASL);
        super.register(
            new AslBase(0x0A, AddressingModes.Single, 0x01),
            new AslBase(0x06, AddressingModes.ZeroPage, 0x02),
            new AslBase(0x16, AddressingModes.ZeroPageX, 0x02),
            new AslBase(0x0E, AddressingModes.Absolute, 0x03),
            new AslBase(0x1E, AddressingModes.AbsoluteX, 0x03)
        );
    }
}
