/*
BIT (test BITs)

Affects Flags: N V Z

MODE           SYNTAX       HEX LEN TIM
Zero Page     BIT $44       $24  2   3
Absolute      BIT $4400     $2C  3   4

BIT sets the Z flag as though the value in the address tested were ANDed with the accumulator.
The S and V flags are set to match bits 7 and 6 respectively in the value stored at the tested address.
BIT is often used to skip one or two following bytes as in:

CLOSE1 LDX #$10   If entered here, we
       .BYTE $2C  effectively perform
CLOSE2 LDX #$20   a BIT test on $20A2,
       .BYTE $2C  another one on $30A2,
CLOSE3 LDX #$30   and end up with the X
CLOSEX LDA #12    register still at $10
       STA ICCOM,X upon arrival here.
*/

import { Flag, Byte, AddressingModes } from '../globals';
import { Flags, BIT } from '../constants';
import { IsOpCode } from '../opCodeBridge';
import { OpCodeFamily, BaseOpCode } from '../opcode.base';

export const testBit = (flag: Flag, accumulator: Byte, target: Byte) => {
    if (accumulator & target) {
        flag &= Flags.ZeroFlagReset;
    } else {
        flag |= Flags.ZeroFlagSet;
    }
    if (target & Flags.NegativeFlag) {
        flag |= Flags.NegativeFlagSet;
    } else {
        flag &= Flags.NegativeFlagReset;
    }
    if (target & Flags.OverflowFlag) {
        flag |= Flags.OverflowFlagSet;
    } else {
        flag &= Flags.OverflowFlagReset;
    }
    return flag;
};

@IsOpCode
export class BitFamily extends OpCodeFamily {
    constructor() {
        super(BIT);
        super.register(
            new BaseOpCode(
                BIT,
                0x24,
                AddressingModes.ZeroPage,
                0x02,
                cpu => {
                    cpu.rP = testBit(
                        cpu.rP,
                        cpu.rA,
                        cpu.getValue(AddressingModes.ZeroPage));
                    cpu.rPC += 1;
                }),
            new BaseOpCode(
                BIT,
                0x2C,
                AddressingModes.Absolute,
                0x03,
                cpu => {
                    cpu.rP = testBit(
                        cpu.rP,
                        cpu.rA,
                        cpu.getValue(AddressingModes.Absolute));
                    cpu.rPC += 2;
                })
        );
    }
}
