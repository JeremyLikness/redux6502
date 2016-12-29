/*
Flag (Processor Status) Instructions

Affect Flags: as noted

These instructions are implied mode, have a length of one byte and require two machine cycles.

MNEMONIC                       HEX
CLC (CLear Carry)              $18
SEC (SEt Carry)                $38
CLI (CLear Interrupt)          $58 ** no support right now
SEI (SEt Interrupt)            $78 ** no support right now
CLV (CLear oVerflow)           $B8
CLD (CLear Decimal)            $D8
SED (SEt Decimal)              $F8

Notes:
  The Interrupt flag is used to prevent (SEI) or enable (CLI) maskable interrupts (aka IRQ's). 
  It does not signal the presence or absence of an interrupt condition. The 6502 will set this flag automatically 
  in response to an interrupt and restore it to its prior status on completion of the interrupt service routine. 
  If you want your interrupt service routine to permit other maskable interrupts, you must clear the I flag in your code.

  The Decimal flag controls how the 6502 adds and subtracts. If set, arithmetic is carried out in packed binary coded decimal. 
  This flag is unchanged by interrupts and is unknown on power-up. The implication is that a CLD should be included in boot 
  or interrupt coding.

  The Overflow flag is generally misunderstood and therefore under-utilised. After an ADC or SBC instruction, 
  the overflow flag will be set if the twos complement result is less than -128 or greater than +127, 
  and it will cleared otherwise. In twos complement, $80 through $FF represents -128 through -1, and $00 through $7F 
  represents 0 through +127. Thus, after:

  CLC
  LDA #$7F ;   +127
  ADC #$01 ; +   +1
the overflow flag is 1 (+127 + +1 = +128), and after:
  CLC
  LDA #$81 ;   -127
  ADC #$FF ; +   -1
the overflow flag is 0 (-127 + -1 = -128). The overflow flag is not affected by increments, decrements, 
shifts and logical operations i.e. only ADC, BIT, CLV, PLP, RTI and SBC affect it. There is no op code to set the 
overflow but a BIT test on an RTS instruction will do the trick.
*/

import { BaseOpCode, OpCodeFamily } from '../opcode.base';
import { IsOpCode } from '../opCodeBridge';
import {
  OpCodeValue,
  AddressingModes,
  Byte,
  setFlags,
  ICpu,
  Flag,
  computeBranch } from '../globals';
import { FLAG_FAMILY, CLC, CLD, CLV, SEC, SED, Memory, Flags } from '../constants';

class FlagBase extends BaseOpCode {

    constructor(value: OpCodeValue, flag: Flag, set = true) {
        super(FLAG_FAMILY, value, AddressingModes.Single, 0x01, cpu => {
            cpu.rP = cpu.setFlag(cpu.rP, flag, set);
        });
    }
}

@IsOpCode
export class FlagFamily extends OpCodeFamily {
    constructor() {
        super(FLAG_FAMILY);
        super.register(
            new FlagBase(0x18, Flags.CarryFlag, false),
            new FlagBase(0x38, Flags.CarryFlag),
            new FlagBase(0xB8, Flags.OverflowFlag, false),
            new FlagBase(0xD8, Flags.DecimalFlag, false),
            new FlagBase(0xF8, Flags.DecimalFlag)
        );
    }
}
