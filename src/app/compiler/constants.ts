export class CompilerPatterns {
    public static opCode: RegExp = /^\s*([A-Z]{3})\s*\S*/;
    public static notWhitespace: RegExp = /\S/; // true when there is non-whitespace
    public static whitespaceTrim: RegExp = /^\s+/; // trim whitespace
    public static whitespaceTrimEnd: RegExp = /\s+$/; // further trim whitespace
    public static labelMath: RegExp =
        /^\s*([A-Z][A-Z_0-9]+)\s*=\s*([A-Z][A-Z_0-9]+)\s*([\+\-])\s*([0-9]{1,3})\s*$/; // LABEL = OTHERLABEL + 1
    public static memoryLabelHex: RegExp = /^(\$[0-9A-F]+):.*/; // $C000:
    public static memoryLabelDec: RegExp = /^([0-9]+):.*/; // 49152:
    public static regularLabel: RegExp = /^([A-Z][A-Z_0-9]+):.*/; // LABEL:
    public static memorySet: RegExp = /^\*\s*\=\s*\$?[0-9A-F]*\s*$/; // *=$C000 or *=49152
    public static setAddress: RegExp = /^[\s]*\*[\s]*=[\s]*/; // for parsing out the value
    public static immediate: RegExp = /^\#([0-9]{1,3})\s*/; // #$0A
    public static immediateHex: RegExp = /^\#([0-9A-F]{1,2})\s*/; // #111
    public static immediateLabel: RegExp = /^\#([<>])([A-Z][A-Z_0-9]+)\s*/; // #<label or #>label 
    public static indirectX: RegExp = /^\(([0-9]{1,3})(\,\s*X)\)\s*/; // (111, X)         
    public static indirectXHex: RegExp = /^\(([0-9A-F]{1,2})(\,\s*X)\)\s*/; // ($C0, X)         
    public static indirectY: RegExp = /^\(([0-9]{1,3})\)(\,\s*Y)\s*/; // (111), Y         
    public static indirectYHex: RegExp = /^\(([0-9A-F]{1,2})\)(\,\s*Y)\s*/; // ($C0), Y         
    public static absoluteX: RegExp = /^([0-9]{1,5})(\,\s*X)\s*/; // 49152, X 
    public static absoluteXHex: RegExp = /^([0-9A-F]{1,4})(\,\s*X)\s*/; // $C000, X 
    public static absoluteXLabel: RegExp = /^([A-Z][A-Z_0-9]+)(\,\s*X)\s*/; // LABEL, X 
    public static absoluteY: RegExp = /^([0-9]{1,5})(\,\s*Y)\s*/; // 49152, Y 
    public static absoluteYHex: RegExp = /^([0-9A-F]{1,4})(\,\s*Y)\s*/; // $C000, Y 
    public static absoluteYLabel: RegExp = /^([A-Z][A-Z_0-9]+)(\,\s*Y)\s*/; // LABEL, Y 
    public static indirect: RegExp = /^\(([0-9]{1,5})\)(^\S)*(\s*\;.*)?$/;  // JMP (49152)
    public static indirectHex: RegExp = /^\(([0-9A-F]{1,4})\)(^\S)*(\s*\;.*)?$/;  // JMP ($C000)
    public static indirectLabel: RegExp = /^\(([A-Z][A-Z_0-9]+)\)\s*/; // JMP (LABEL)
    public static absolute: RegExp = /^([0-9]{1,5})(^\S)*(\s*\;.*)?$/;  // JMP 49152
    public static absoluteHex: RegExp = /^([0-9A-F]{1,4})(^\S)*(\s*\;.*)?$/;  // JMP $C000
    public static absoluteLabel: RegExp = /^([A-Z][A-Z_0-9]+)\s*/; // JMP LABEL
}

export const BAD_LABEL = 'Bad label: could not find dependent:';
export const CANNOT_REDEFINE = 'Cannot redefine label:';
export const DUPLICATE_LABEL = 'Duplicate label:';
export const INDXINDRX_OUT_OF_RANGE = 'Indexed Indirect X value of out range:';
export const INDINDXY_OUT_OF_RANGE = 'Indirect Indexed Y value of out range:';
export const INVALID_ASSEMBLY = 'Invalid assembly:';
export const INVALID_BRANCH = 'Invalid branch op:';
export const INVALID_DCB = 'DCB requires a list of bytes to be inserted into the compilation stream.';
export const INVALID_DCB_LIST = 'DCB with invalid value list:';
export const INVALID_DCB_RANGE = 'DCB with value out of range:';
export const INVALID_LABEL_MATH = 'Invalid label math:';
export const INVALID_OP_NAME = 'Invalid op code name:';
export const LABEL_NOT_DEFINED = 'Label not defined:';
export const NO_INDXINDRX_SUPPORT = 'doesn\'t support indexed indirect X mode:';
export const NO_INDXINDRY_SUPPORT = 'doesn\'t support indirect indexed Y mode:';
export const NO_IMMEDIATE_SUPPORT = 'doesn\'t support immediate mode:';
export const NOT_IMPLEMENTED = 'Not implemented.';
export const OUT_OF_RANGE = 'Value out of range:';
export const REQUIRES_PARAMETER = 'Operation requires a parameter:';
export const IMMEDIATE_OUT_OF_RANGE = 'Immediate value out of range:';

export const DCB = 'DCB';
