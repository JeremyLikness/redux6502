/*
RTS (ReTurn from Subroutine)

Affects Flags: none

MODE           SYNTAX       HEX LEN TIM
Implied       RTS           $60  1   6

RTS pulls the top two bytes off the stack (low byte first) and transfers program control to that address+1. 
It is used, as expected, to exit a subroutine invoked via JSR which pushed the address-1.
RTS is frequently used to implement a jump table where addresses-1 are pushed onto the stack and accessed via RTS eg. 
to access the second of four routines:

 LDX #1
 JSR EXEC
 JMP SOMEWHERE

LOBYTE
 .BYTE <ROUTINE0-1,<ROUTINE1-1
 .BYTE <ROUTINE2-1,<ROUTINE3-1

HIBYTE
 .BYTE >ROUTINE0-1,>ROUTINE1-1
 .BYTE >ROUTINE2-1,>ROUTINE3-1

EXEC
 LDA HIBYTE,X
 PHA
 LDA LOBYTE,X
 PHA
 RTS
*/

import { BaseOpCode, OpCodeFamily } from '../opcode.base';
import { IsOpCode } from '../opCodeBridge';
import { OpCodeValue, AddressingModes, Byte, Address, setFlags, ICpu } from '../globals';
import { RTS, Memory } from '../constants';

@IsOpCode
export class RtsFamily extends OpCodeFamily {
    constructor() {
        super(RTS);
        super.register(new BaseOpCode(RTS, 0x60, AddressingModes.Single, 0x01, cpu => {
            let loByte = cpu.stackPop() + 0x01,
                hiByte = cpu.stackPop() << Memory.BitsInByte,
                addr: Address = loByte + hiByte;
            cpu.rPC = addr;
        }));
    }
}
