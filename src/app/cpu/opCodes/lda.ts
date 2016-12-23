import { BaseOpCode, OpCodeFamily } from '../opcode.base';
import { OpCodeValue, AddressingModes, Byte, setFlags } from '../globals';

export class LdaBase extends BaseOpCode {

    constructor(value: OpCodeValue, mode: AddressingModes, size: Byte) {
        super('LDA', value, mode, size, cpu => {
            let target = cpu.getValue(mode), pc = size - 1;
            cpu.rA = target;
            cpu.rP = setFlags(cpu.rP, cpu.rA);
            cpu.rPC = cpu.rPC += pc;
        });
    }
}

class LdaImmediate extends LdaBase {
    constructor() {
        super(0xA9, AddressingModes.Immediate, 0x02);
    }
}

class LdaZeroPage extends LdaBase {
    constructor() {
        super(0xA5, AddressingModes.ZeroPage, 0x02);
    }
}

class LdaZeroPageX extends LdaBase {
    constructor() {
        super(0xB5, AddressingModes.ZeroPageX, 0x02);
    }
}

class LdaAbsolute extends LdaBase {
    constructor() {
        super(0xAD, AddressingModes.Absolute, 0x03);
    }
}

class LdaAbsoluteX extends LdaBase {
    constructor() {
        super(0xBD, AddressingModes.AbsoluteX, 0x03);
    }
}

class LdaAbsoluteY extends LdaBase {
    constructor() {
        super(0xB9, AddressingModes.AbsoluteY, 0x03);
    }
}

class LdaIndirectX extends LdaBase {
    constructor() {
        super(0xA1, AddressingModes.IndexedIndirectX, 0x02);
    }
}

class LdaIndirectY extends LdaBase {
    constructor() {
        super(0xB1, AddressingModes.IndirectIndexedY, 0x02);
    }
}

export class LdaFamily extends OpCodeFamily {
    constructor() {
        super('LDA');
        super.register(
            new LdaImmediate(),
            new LdaZeroPage(),
            new LdaZeroPageX(),
            new LdaAbsolute(),
            new LdaAbsoluteX(),
            new LdaAbsoluteY(),
            new LdaIndirectX(),
            new LdaIndirectY()
        );
    }
}
