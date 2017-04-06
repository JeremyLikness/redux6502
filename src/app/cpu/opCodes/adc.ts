/* 
ADC (ADd with Carry)

Affects Flags: S V Z C

MODE           SYNTAX       HEX LEN TIM
Immediate     ADC #$44      $69  2   2
Zero Page     ADC $44       $65  2   3
Zero Page,X   ADC $44,X     $75  2   4
Absolute      ADC $4400     $6D  3   4
Absolute,X    ADC $4400,X   $7D  3   4+
Absolute,Y    ADC $4400,Y   $79  3   4+
Indirect,X    ADC ($44,X)   $61  2   6
Indirect,Y    ADC ($44),Y   $71  2   5+

ADC results are dependant on the setting of the decimal flag. In decimal mode, addition is carried out on the assumption
that the values involved are packed BCD (Binary Coded Decimal).

There is no way to add without carry.
*/

import { BaseOpCode, OpCodeFamily } from '../opcode.base';
import { IsOpCode } from '../opCodeBridge';
import { OpCodeValue, AddressingModes, Byte, setFlags, addWithCarry } from '../globals';
import { ADC } from '../constants';

class AdcBase extends BaseOpCode {

    constructor(value: OpCodeValue, mode: AddressingModes, size: Byte) {
        super(ADC, value, mode, size, cpu => {
            const target = cpu.getValue(mode), pc = size - 1,
                result = addWithCarry(cpu.rP, cpu.rA, target);
            cpu.rA = result.result;
            cpu.rP = result.flag;
            cpu.rPC += pc;
        });
    }
}

@IsOpCode
export class AdcFamily extends OpCodeFamily {
    constructor() {
        super(ADC);
        super.register(
            new AdcBase(0x69, AddressingModes.Immediate, 0x02),
            new AdcBase(0x65, AddressingModes.ZeroPage, 0x02),
            new AdcBase(0x75, AddressingModes.ZeroPageX, 0x02),
            new AdcBase(0x6D, AddressingModes.Absolute, 0x03),
            new AdcBase(0x7D, AddressingModes.AbsoluteX, 0x03),
            new AdcBase(0x79, AddressingModes.AbsoluteY, 0x03),
            new AdcBase(0x61, AddressingModes.IndexedIndirectX, 0x02),
            new AdcBase(0x71, AddressingModes.IndirectIndexedY, 0x02)
        );
    }
}
