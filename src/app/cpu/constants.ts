import { Flag } from './globals';

export class Memory {
    public static Max: number = 0xFFFF; // 65535
    public static Size: number = Memory.Max + 0x01; // 65536
    public static ByteMask: number = 0xFF; // force to byte 
    public static NibbleMask: number = 0x0F; // force to nibble 
    public static HighNibbleMask: number = 0xF0; // force to nibble with higher bits
    public static Stack: number = 0x0100; // stack (255 bytes)
    public static BitsInNibble: number = 4; // bits in a nibble
    public static BitsInByte: number = 8; // bits in a byte
    public static DefaultStart: number = 0x0200; // default pc start (after zero page and stack)
    public static BranchBack: number = 0x7F; // branch test for forward or backwards
    public static BranchOffset: number = 0x100; // offset to compute backwards branches
}

export class Flags {
    public static InitialState = parseInt('00100000', 2);
    public static CarryFlagSet: Flag = 0x01; // 00000001
    public static CarryFlag: Flag = Flags.CarryFlagSet;
    public static CarryFlagReset: Flag = Memory.ByteMask - Flags.CarryFlagSet;
    public static ZeroFlagSet: Flag = 0x02; // 00000010
    public static ZeroFlag: Flag = Flags.ZeroFlagSet;
    public static ZeroFlagReset: Flag = Memory.ByteMask - Flags.ZeroFlagSet;
    public static DecimalFlagSet: Flag = 0x08; // 00001000
    public static DecimalFlag: Flag = Flags.DecimalFlagSet;
    public static DecimalFlagReset: Flag = Memory.ByteMask - Flags.DecimalFlagSet;
    public static OverflowFlagSet: Flag = 0x40; // 01000000
    public static OverflowFlag: Flag = Flags.OverflowFlagSet;
    public static OverflowFlagReset: Flag = Memory.ByteMask - Flags.OverflowFlagSet;
    public static NegativeFlagSet: Flag = 0x80; // 10000000
    public static NegativeFlag: Flag = Flags.NegativeFlagSet;
    public static NegativeFlagReset: Flag = Memory.ByteMask - Flags.NegativeFlagSet;
}

export const AddressingModeCount = 12; // number of addressing modes available

export const CPU_STORE = 'CpuStore';

export const MEMORY_OVERFLOW = 'Memory overflow.';
export const INVALID_OP = 'Invalid op code.';
export const STACK_OVERFLOW = 'Stack overflow.';
export const STACK_EMPTY = 'Cannot pop empty stack.';

export const BRANCH_FAMILY = 'Branches';
export const FLAG_FAMILY = 'Flags';
export const REGISTERS = 'Registers';
export const STACK = 'Stack';

export const INVALID = '???';

export const ADC = 'ADC';
export const AND = 'AND';
export const ASL = 'ASL';
export const BCC = 'BCC';
export const BCS = 'BCS';
export const BEQ = 'BEQ';
export const BIT = 'BIT';
export const BMI = 'BMI';
export const BNE = 'BNE';
export const BPL = 'BPL';
export const BVC = 'BVC';
export const BVS = 'BVS';
export const CLC = 'CLC';
export const CLD = 'CLD';
export const CLV = 'CLV';
export const CMP = 'CMP';
export const CPX = 'CPX';
export const CPY = 'CPY';
export const DEC = 'DEC';
export const DEX = 'DEX';
export const DEY = 'DEY';
export const EOR = 'EOR';
export const INC = 'INC';
export const INX = 'INX';
export const INY = 'INY';
export const JSR = 'JSR';
export const LDA = 'LDA';
export const LDX = 'LDX';
export const LDY = 'LDY';
export const LSR = 'LSR';
export const JMP = 'JMP';
export const NOP = 'NOP';
export const ORA = 'ORA';
export const PHA = 'PHA';
export const PHP = 'PHP';
export const PLA = 'PLA';
export const PLP = 'PLP';
export const ROL = 'ROL';
export const ROR = 'ROR';
export const SBC = 'SBC';
export const SEC = 'SEC';
export const SED = 'SED';
export const STA = 'STA';
export const STX = 'STX';
export const STY = 'STY';
export const RTS = 'RTS';
export const TAX = 'TAX';
export const TAY = 'TAY';
export const TSX = 'TSX';
export const TYA = 'TYA';
export const TXA = 'TXA';
export const TXS = 'TXS';
