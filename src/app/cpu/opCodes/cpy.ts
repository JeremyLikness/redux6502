/*
CPY (ComPare Y register)

Affects Flags: S Z C

MODE           SYNTAX       HEX LEN TIM
Immediate     CPY #$44      $C0  2   2
Zero Page     CPY $44       $C4  2   3
Absolute      CPY $4400     $CC  3   4

Operation and flag results are identical to equivalent mode accumulator CMP ops.
*/

import { BaseOpCode, OpCodeFamily } from '../opcode.base';
import { IsOpCode } from '../opCodeBridge';
import { OpCodeValue, AddressingModes, Byte, setFlags, compareWithFlag } from '../globals';
import { CPY } from '../constants';

class CpyBase extends BaseOpCode {

    constructor(value: OpCodeValue, mode: AddressingModes, size: Byte) {
        super(CPY, value, mode, size, cpu => {
            let target = cpu.getValue(mode), pc = size - 1;
            cpu.rP = compareWithFlag(cpu.rP, cpu.rY, target);
            cpu.rPC = cpu.rPC += pc;
        });
    }
}

@IsOpCode
export class CpyFamily extends OpCodeFamily {
    constructor() {
        super(CPY);
        super.register(
            new CpyBase(0xC0, AddressingModes.Immediate, 0x02),
            new CpyBase(0xC4, AddressingModes.ZeroPage, 0x02),
            new CpyBase(0xCC, AddressingModes.Absolute, 0x03)
        );
    }
}

