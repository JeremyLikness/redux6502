import { Flag } from './globals';

export class Memory {
    public static Max: number = 0xFFFF; // 65535
    public static Size: number = Memory.Max + 0x01; // 65536
    public static ByteMask: number = 0xFF; // force to byte 
    public static NibbleMask: number = 0x0F; // force to nibble 
    public static HighNibbleMask: number = 0xF0; // force to nibble with higher bits
    public static Stack: number = 0x0100; // stack (255 bytes)
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
