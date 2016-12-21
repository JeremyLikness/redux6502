import { Memory, Address, Byte, ZeroPage, Flag, Word, AddressingModes } from './constants';

export type Register = number;
export type RAM = number[];
export type OpCodeValue = number;

export interface IOpCode {
    name: string;
    value: OpCodeValue;
    mode: AddressingModes;
    size: number;
    execute: (cpu: Cpu) => void;
}

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

export const computeBranch = (address: Address, offset: Byte) => {
    let result = 0;
    if (offset > Memory.BranchBack) {
        result = (address - (Memory.BranchOffset - offset));
    } else {
        result = address + offset;
    }
    return result;
};

export class Cpu {

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
        let addressLocation: Address = this.addrPopWord();
        let newAddress: Address = this.peek(addressLocation) + (this.peek(addressLocation + 1) << Memory.BitsInByte);
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

    public getValue(mode: AddressingModes): Byte {
        switch (mode) {
            case AddressingModes.Absolute:
                return this.peek(this.addrPopWord());
            case AddressingModes.AbsoluteX:
                return this.peek(this.addrAbsoluteX());
            case AddressingModes.AbsoluteY:
                return this.peek(this.addrAbsoluteY());
            case AddressingModes.Immediate:
                return this.addrPop();
            case AddressingModes.IndexedIndirectX:
                return this.peek(this.addrIndexedIndirectX());
            case AddressingModes.IndirectIndexedY:
                return this.peek(this.addrIndirectIndexedY());
            case AddressingModes.Indirect:
                return this.peek(this.addrIndirect());
            case AddressingModes.Relative:
                let branch = this.addrPop();
                return computeBranch(this.rPC, branch);
            case AddressingModes.ZeroPage:
                return this.peek(this.addrPop());
            case AddressingModes.ZeroPageX:
                return this.peek(this.addrZeroPageX());
            case AddressingModes.ZeroPageY:
                return this.peek(this.addrZeroPageY());
            default:
                return null;
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
