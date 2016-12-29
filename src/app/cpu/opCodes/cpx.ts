/*
CPX (ComPare X register)

Affects Flags: S Z C

MODE           SYNTAX       HEX LEN TIM
Immediate     CPX #$44      $E0  2   2
Zero Page     CPX $44       $E4  2   3
Absolute      CPX $4400     $EC  3   4

Operation and flag results are identical to equivalent mode accumulator CMP ops.
*/

import { BaseOpCode, OpCodeFamily } from '../opcode.base';
import { IsOpCode } from '../opCodeBridge';
import { OpCodeValue, AddressingModes, Byte, setFlags, compareWithFlag } from '../globals';
import { CPX } from '../constants';

class CpxBase extends BaseOpCode {

    constructor(value: OpCodeValue, mode: AddressingModes, size: Byte) {
        super(CPX, value, mode, size, cpu => {
            let target = cpu.getValue(mode), pc = size - 1;
            cpu.rP = compareWithFlag(cpu.rP, cpu.rX, target);
            cpu.rPC = cpu.rPC += pc;
        });
    }
}

@IsOpCode
export class CpxFamily extends OpCodeFamily {
    constructor() {
        super(CPX);
        super.register(
            new CpxBase(0xE0, AddressingModes.Immediate, 0x02),
            new CpxBase(0xE4, AddressingModes.ZeroPage, 0x02),
            new CpxBase(0xEC, AddressingModes.Absolute, 0x03)
        );
    }
}

