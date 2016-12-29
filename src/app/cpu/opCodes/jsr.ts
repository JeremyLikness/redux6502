/*
JSR (Jump to SubRoutine)

Affects Flags: none

MODE           SYNTAX       HEX LEN TIM
Absolute      JSR $5597     $20  3   6

JSR pushes the address-1 of the next operation on to the stack before transferring program control to the 
following address. Subroutines are normally terminated by a RTS op code.
*/

import { BaseOpCode, OpCodeFamily } from '../opcode.base';
import { IsOpCode } from '../opCodeBridge';
import { OpCodeValue, AddressingModes, Byte, setFlags, ICpu } from '../globals';
import { JSR, Memory } from '../constants';

@IsOpCode
export class JsrFamily extends OpCodeFamily {
    constructor() {
        super(JSR);
        super.register(new BaseOpCode(JSR, 0x20, AddressingModes.Absolute, 0x03, cpu => {
            let newAddr = cpu.addrPopWord(),
                hiByte = ((cpu.rPC + 1) >> Memory.BitsInByte) & Memory.ByteMask,
                loByte = (cpu.rPC + 1) & Memory.ByteMask;
            cpu.stackPush(hiByte);
            cpu.stackPush(loByte);
            cpu.rPC = newAddr;
        }));
    }
}
