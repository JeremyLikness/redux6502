import {
    Address,
    Byte,
    OpCodeValue,
    ICpu,
    AddressingModes,
    hexHelper,
    computeBranch } from '../cpu/globals';

import { Memory } from '../cpu/constants';

export interface ILabel {
    address: Address;
    labelName: string;
    dependentLabelName: string;
    offset: Byte;
}

export interface ICompiledLine {
    address: Address;
    opCode: OpCodeValue;
    code: Byte[];
    process: boolean;
    label: string;
    high: boolean;
}

export interface ICompilerResult {
    labels: ILabel[];
    compiledLines: ICompiledLine[];
}

export const decompileOp = (cpu: ICpu, address: Address) => {
    let opCode = cpu.memory[address];
    let operation = cpu.fetch(opCode);
    let name = operation.name;
    let parms = '';
    switch (operation.mode) {
        case AddressingModes.Absolute:
            parms = `$${hexHelper(cpu.memory[address + 2],2)}${hexHelper(cpu.memory[address + 1],2)}`;
            break;
        case AddressingModes.AbsoluteX:
            parms = `$${hexHelper(cpu.memory[address + 2],2)}${hexHelper(cpu.memory[address + 1],2)}, X`;
            break;
        case AddressingModes.AbsoluteY:
            parms = `$${hexHelper(cpu.memory[address + 2],2)}${hexHelper(cpu.memory[address + 1],2)}, Y`;
            break;
        case AddressingModes.Immediate:
            parms = `#$${hexHelper(cpu.memory[address + 1],2)}`;
            break;
        case AddressingModes.IndexedIndirectX:
            parms = `($${hexHelper(cpu.memory[address + 1],2)}, X)`;
            break;
        case AddressingModes.Indirect:
            parms = `($${hexHelper(cpu.memory[address + 2], 2)}${hexHelper(cpu.memory[address + 1], 2)})`;
            break;
        case AddressingModes.IndirectIndexedY:
            parms = `($${hexHelper(cpu.memory[address + 1],2)}), Y`;
            break;
        case AddressingModes.Relative:
            let offset = computeBranch(address, cpu.memory[address + 1]);
            parms = `$${hexHelper(offset, 4)}`;
            break;
        case AddressingModes.Single:
            break;
        case AddressingModes.ZeroPage:
            parms = `$${hexHelper(cpu.memory[address + 1])}`;
            break;
        case AddressingModes.ZeroPageX:
            parms = `$${hexHelper(cpu.memory[address + 1])}, X`;
            break;
        case AddressingModes.ZeroPageY:
            parms = `$${hexHelper(cpu.memory[address + 1])}, Y`;
            break;
    }

    return `$${hexHelper(address, 4)}: ${name} ${parms}`.trim();
};

export const decompileOps = (cpu: ICpu, startAddress: Address, lines = 10) => {
    let addr = startAddress, result: string[] = [], count = lines;
    while (lines && addr <= Memory.Max) {
        result.push(decompileOp(cpu, addr));
        addr += cpu.fetch(cpu.memory[addr]).size;
        lines -= 1;
    }
    return result;
};
