import {
    Address,
    Byte,
    ZeroPage,
    Flag,
    Word,
    AddressingModes,
    Register,
    RAM,
    IOpCodes,
    ICpu,
    computeBranch,
    hexHelper
} from './globals';

import { Memory, INVALID_OP, MEMORY_OVERFLOW, STACK_OVERFLOW, STACK_EMPTY } from './constants';

// static list of registered op codes, is then mapped into the IOpCodeMap in the ctor()
import { OP_CODES } from './opCodeBridge';

export class CpuStats {
    public started: Date;
    public ellapsedMilliseconds: number;
    public instructionsPerSecond: number;
    public instructionCount: number;
    public lastCheck: number;
}

export class CpuControls {
    public autoRefresh: boolean;
    public runningState: boolean;
    public errorState: boolean;
    public errorMessage: string;
}

interface IOpCodeMap { [opCode: number]: IOpCodes; };

export class Cpu implements ICpu {

    public debug: boolean;

    public rA: Register & Byte;
    public rX: Register & Byte;
    public rY: Register & Byte;
    public rP: Register & Byte;
    public rPC: Address & Word;
    public rSP: Address & Word;

    public cycles: number;

    public memory: RAM;

    public stats: CpuStats;

    public controls: CpuControls;

    private _opCodeMap: IOpCodeMap = {};

    constructor() {
        OP_CODES.forEach(family =>
            family.codes.forEach(code =>
        this._opCodeMap[code] = family));
    }

    public execute(): void {
        let opCode = this.memory[this.rPC];
        this.rPC += 1;
        let opFamily = this._opCodeMap[opCode];
        if (opFamily) {
            opFamily.execute(this, opCode);
            if (this.rPC > Memory.Max) {
                throw new Error(MEMORY_OVERFLOW);
            }
        } else {
            throw new Error(INVALID_OP + ` (${opCode})`);
        }
    }

    public checkFlag(flag: Flag): boolean {
        return (this.rP & flag) > 0;
    }

    public peek(address: Address): Byte {
        return this.memory[address & Memory.Max] & Memory.ByteMask;
    }

    public setFlag(originalFlag: Flag, flag: Flag, setAction = true): Flag {
        setAction ? originalFlag |= flag : originalFlag &= (Memory.ByteMask - flag);
        return originalFlag;
    }

    public addrPop(offset: Byte = 0): Byte {
        let value: Byte = this.peek((this.rPC + offset) & Memory.Max);
        return value;
    }

    public addrPopWord(): Word {
        let word = this.addrPop() + (this.addrPop(1) << Memory.BitsInByte);
        return word;
    }

    public addrAbsoluteX(): Address {
        return (this.addrPopWord() + this.rX) & Memory.Max;
    }

    public addrAbsoluteY(): Address {
        return (this.addrPopWord() + this.rY) & Memory.Max;
    }

    public addrIndirect(): Address {
        let addressBaseLow: Byte = this.addrPop();
        let addressBaseHigh: Byte = this.addrPop(0x01);
        let addressNextLow: Byte = (addressBaseLow + 1) & Memory.ByteMask;
        let addressLocation: Address = addressBaseLow + (addressBaseHigh << Memory.BitsInByte);
        let addressLocationNext: Address = addressNextLow + (addressBaseHigh << Memory.BitsInByte);
        let newAddress: Address = this.peek(addressLocation) + (this.peek(addressLocationNext) << Memory.BitsInByte);
        return newAddress & Memory.Max;
    }

    public addrIndexedIndirectX(): Address {
        let zeroPage: ZeroPage = (this.addrPop() + this.rX) & Memory.ByteMask;
        let address: Address = this.peek(zeroPage) + (this.peek(zeroPage + 1) << Memory.BitsInByte);
        return address;
    }

    public addrIndirectIndexedY(): Address {
        let zeroPage: ZeroPage = this.addrPop();
        let target: Address = this.peek(zeroPage) + (this.peek(zeroPage + 1) << Memory.BitsInByte)
            + this.rY;
        return target & Memory.Max;
    }

    public addrZeroPageX(): Address {
        let zeroPage: ZeroPage = (this.addrPop() + this.rX) & Memory.ByteMask;
        return zeroPage;
    }

    public addrZeroPageY(): ZeroPage {
        let zeroPage: ZeroPage = (this.addrPop() + this.rY) & Memory.ByteMask;
        return zeroPage;
    }

    public addrForMode(mode: AddressingModes): Word {
        switch (mode) {
            case AddressingModes.Absolute:
                return this.addrPopWord();
            case AddressingModes.AbsoluteX:
                return this.addrAbsoluteX();
            case AddressingModes.AbsoluteY:
                return this.addrAbsoluteY();
            case AddressingModes.IndexedIndirectX:
                return this.addrIndexedIndirectX();
            case AddressingModes.IndirectIndexedY:
                return this.addrIndirectIndexedY();
            case AddressingModes.Indirect:
                return this.addrIndirect();
            case AddressingModes.Relative:
                let branch = this.addrPop();
                return computeBranch(this.rPC, branch);
            case AddressingModes.ZeroPage:
                return this.addrPop();
            case AddressingModes.ZeroPageX:
                return this.addrZeroPageX();
            case AddressingModes.ZeroPageY:
                return this.addrZeroPageY();
            default:
                return null;
        }
    }

    public getValue(mode: AddressingModes): Byte {
        let addr = this.addrForMode(mode);
        switch (mode) {
            case AddressingModes.Absolute:
                return this.peek(addr);
            case AddressingModes.AbsoluteX:
                return this.peek(addr);
            case AddressingModes.AbsoluteY:
                return this.peek(addr);
            case AddressingModes.Immediate:
                return this.addrPop();
            case AddressingModes.IndexedIndirectX:
                return this.peek(addr);
            case AddressingModes.IndirectIndexedY:
                return this.peek(addr);
            case AddressingModes.Indirect:
                return this.peek(addr);
            case AddressingModes.Relative:
                return addr;
            case AddressingModes.ZeroPage:
                return this.peek(addr);
            case AddressingModes.ZeroPageX:
                return this.peek(addr);
            case AddressingModes.ZeroPageY:
                return this.peek(addr);
            default:
                return null;
        }
    }

    public stackPush(value: Byte): void {
        if (this.rSP >= 0x0) {
            this.rSP -= 1;
            this.memory[this.rSP + Memory.Stack] = value & Memory.ByteMask;
        } else {
            throw new Error(STACK_OVERFLOW);
        }
    }

    public stackPop(): Byte {
        if (this.rSP < Memory.Stack) {
            let value = this.peek(this.rSP + Memory.Stack);
            this.rSP += 1;
            return value;
        } else {
            throw new Error(STACK_EMPTY);
        }
    }
}
export const cloneCpu = (cpu: Cpu) => {
    let clonedStats = Object.assign(new CpuStats(), cpu.stats);
    let clonedControls = Object.assign(new CpuControls, cpu.controls);
    let clonedCpu = Object.assign(new Cpu(), cpu);
    clonedCpu.stats = clonedStats;
    clonedCpu.controls = clonedControls;
    clonedCpu.memory = [...cpu.memory];
    return clonedCpu;
};

export const initialCpuState = () => {

    let cpu = new Cpu();

    cpu.rA = cpu.rX = cpu.rY = cpu.rP = 0x00;
    cpu.rPC = Memory.DefaultStart;
    cpu.rSP = Memory.Stack;
    cpu.memory = Array(Memory.Size).fill(0x00);

    let stats = new CpuStats();
    stats.started = null;
    stats.ellapsedMilliseconds = 0;
    stats.instructionsPerSecond = 0;
    stats.lastCheck = null;
    stats.instructionCount = 0;
    cpu.stats = stats;

    let controls = new CpuControls();
    controls.runningState = false;
    controls.errorState = false;
    cpu.controls = controls;
    return cpu;
};
