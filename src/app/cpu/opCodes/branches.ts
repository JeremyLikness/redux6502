/*
Branch Instructions

Affect Flags: none

All branches are relative mode and have a length of two bytes. Syntax is "Bxx Displacement" or (better) "Bxx Label".
See the notes on the Program Counter for more on displacements.

Branches are dependant on the status of the flag bits when the op code is encountered.
A branch not taken requires two machine cycles.
Add one if the branch is taken and add one more if the branch crosses a page boundary.

MNEMONIC                       HEX
BPL (Branch on PLus)           $10
BMI (Branch on MInus)          $30
BVC (Branch on oVerflow Clear) $50
BVS (Branch on oVerflow Set)   $70
BCC (Branch on Carry Clear)    $90
BCS (Branch on Carry Set)      $B0
BNE (Branch on Not Equal)      $D0
BEQ (Branch on EQual)          $F0

There is no BRA (BRanch Always) instruction but it can be easily emulated by branching on the basis of a known condition.
One of the best flags to use for this purpose is the oVerflow which is unchanged by all but addition and subtraction operations.
A page boundary crossing occurs when the branch destination is on a different page than the instruction
AFTER the branch instruction. For example:

  SEC
  BCS LABEL
  NOP
A page boundary crossing occurs (i.e. the BCS takes 4 cycles) when (the address of) LABEL and the NOP are on different pages.
This means that
        CLV
        BVC LABEL
  LABEL NOP
the BVC instruction will take 3 cycles no matter what address it is located at.
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
    computeBranch
} from '../globals';
import { BRANCH_FAMILY, BCC, BCS, BEQ, BMI, BNE, BPL, BVC, BVS, Memory, Flags } from '../constants';

class BranchBase extends BaseOpCode {

    constructor(name: string, value: OpCodeValue, predicate: (cpu: ICpu) => boolean) {
        super(name, value, AddressingModes.Relative, 0x02, cpu => {
            if (predicate(cpu)) {
                const opAddress = cpu.rPC - 1, offset = cpu.addrPop();
                cpu.rPC = computeBranch(opAddress, offset);
            } else {
                cpu.rPC += 1;
            }
        });
    }
}

@IsOpCode
export class BranchFamily extends OpCodeFamily {
    constructor() {
        super(BRANCH_FAMILY);
        super.register(
            new BranchBase(BPL, 0x10, cpu => !cpu.checkFlag(Flags.NegativeFlag)),
            new BranchBase(BMI, 0x30, cpu => cpu.checkFlag(Flags.NegativeFlag)),
            new BranchBase(BVC, 0x50, cpu => !cpu.checkFlag(Flags.OverflowFlag)),
            new BranchBase(BVS, 0x70, cpu => cpu.checkFlag(Flags.OverflowFlag)),
            new BranchBase(BCC, 0x90, cpu => !cpu.checkFlag(Flags.CarryFlag)),
            new BranchBase(BCS, 0xB0, cpu => cpu.checkFlag(Flags.CarryFlag)),
            new BranchBase(BNE, 0xD0, cpu => !cpu.checkFlag(Flags.ZeroFlag)),
            new BranchBase(BEQ, 0xF0, cpu => cpu.checkFlag(Flags.ZeroFlag)),
        );
    }
}
