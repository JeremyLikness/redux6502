export type Byte = number;
export type Word = number;
export type Address = Word;
export type ZeroPage = Byte;

export class Memory {
    public static Max: number = 0xFFFF;
    public static Size: number = Memory.Max + 0x01;
    public static ByteMask: number = 0xFF;
    public static NibbleMask: number = 0x0F;
    public static HighNibbleMask: number = 0xF0;
    public static Stack: number = 0x0100;
    public static BitsInByte: number = 8;
    public static DefaultStart: number = 0x0200;
    public static BranchBack: number = 0x7F;
    public static BranchOffset: number = 0x100;
    public static MaxInstructionsDecompile: number = 50;
    public static ZeroPageTimerSeconds: number = 0xFB;
    public static ZeroPageTimerMilliseconds: number = 0xFC;
    public static ZeroPageRandomNumberGenerator: number = 0xFD;
    public static ZeroPageCharacterOutput: number = 0xFE;
    public static ZeroPageCharacterInput: number = 0xFF;
}

export class Display {
    public static Max: number = 0x3FF;
    public static Size: number = Display.Max + 0x01;
    public static XMax: number = 0x20;
    public static YMax: number = 0x20;
    public static CanvasXMax: number = 0xC0;
    public static CanvasYMax: number = 0xC0;
    public static XFactor: number = Display.CanvasXMax / Display.XMax;
    public static YFactor: number = Display.CanvasYMax / Display.YMax;
    public static DisplayStart: number = 0xFC00;
    public static ConsoleLines: number = 100;
}

export type Flag = number;

export class Flags {
    public static CarryFlagSet: Flag = 0x01;
    public static CarryFlag: Flag = Flags.CarryFlagSet;
    public static CarryFlagReset: Flag = Memory.ByteMask - Flags.CarryFlagSet;
    public static ZeroFlagSet: Flag = 0x02;
    public static ZeroFlag: Flag = Flags.ZeroFlagSet;
    public static ZeroFlagReset: Flag = Memory.ByteMask - Flags.ZeroFlagSet;
    public static DecimalFlagSet: Flag = 0x08;
    public static DecimalFlag: Flag = Flags.DecimalFlagSet;
    public static DecimalFlagReset: Flag = Memory.ByteMask - Flags.DecimalFlagSet;
    public static OverflowFlagSet: Flag = 0x40;
    public static OverflowFlag: Flag = Flags.OverflowFlagSet;
    public static OverflowFlagReset: Flag = Memory.ByteMask - Flags.OverflowFlagSet;
    public static NegativeFlagSet: Flag = 0x80;
    public static NegativeFlag: Flag = Flags.NegativeFlagSet;
    public static NegativeFlagReset: Flag = Memory.ByteMask - Flags.NegativeFlagSet;
}

export const AddressingModeCount = 12;

export enum AddressingModes {
    Immediate,
    ZeroPage,
    ZeroPageX,
    ZeroPageY,
    Absolute,
    AbsoluteX,
    AbsoluteY,
    Indirect,
    IndexedIndirectX,
    IndirectIndexedY,
    Single,
    Relative
}
