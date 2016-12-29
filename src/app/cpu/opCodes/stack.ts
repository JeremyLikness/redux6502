/*
Stack Instructions

These instructions are implied mode, have a length of one byte and require machine cycles as indicated. 
The "Pull" operations are known as "POP" on most other microprocessors. With the 6502, the stack is always on page 
one ($100-$1FF) and works top down.

MNEMONIC                        HEX TIM
TXS (Transfer X to Stack ptr)   $9A  2
TSX (Transfer Stack ptr to X)   $BA  2
PHA (PusH Accumulator)          $48  3
PLA (PuLl Accumulator)          $68  4
PHP (PusH Processor status)     $08  3
PLP (PuLl Processor status)     $28  4
*/

import { BaseOpCode, OpCodeFamily } from '../opcode.base';
import { IsOpCode } from '../opCodeBridge';
import { AddressingModes, setFlags, ICpu, OpCodeValue } from '../globals';
import { STACK, TXS, TSX, PHA, PLA, PHP, PLP, Memory } from '../constants';

class StackOpCode extends BaseOpCode {
    constructor(name: string, opCode: OpCodeValue, execute: (cpu: ICpu) => void) {
        super(name, opCode, AddressingModes.Single, 0x01, execute);
    }
}

@IsOpCode
export class StackFamily extends OpCodeFamily {
    constructor() {
        super(STACK);
        super.register(
            new StackOpCode(TXS, 0x9A, cpu => cpu.rSP = cpu.rX),
            new StackOpCode(TSX, 0xBA, cpu => {
                cpu.rX = cpu.rSP;
                cpu.rP = setFlags(cpu.rP, cpu.rX);
            }),
            new StackOpCode(PHA, 0x48, cpu => cpu.stackPush(cpu.rA)),
            new StackOpCode(PLA, 0x68, cpu => {
                cpu.rA = cpu.stackPop();
                cpu.rP = setFlags(cpu.rP, cpu.rA);
            }),
            new StackOpCode(PHP, 0x08, cpu => cpu.stackPush(cpu.rP)),
            new StackOpCode(PLP, 0x28, cpu => cpu.rP = cpu.stackPop())
        );
    }
}
