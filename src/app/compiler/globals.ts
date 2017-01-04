import {
    Address,
    Byte,
    OpCodeValue,
    ICpu,
    AddressingModes,
    hexHelper,
    computeBranch } from '../cpu/globals';

import { Memory } from '../cpu/constants';

import { ILabel, findLabel } from './labels';

import {
    LABEL_NOT_DEFINED,
    OUT_OF_RANGE,
    NOT_IMPLEMENTED } from './constants';

export interface ICompiledLine {
    address: Address; // address for line
    opCode: OpCodeValue;
    mode: AddressingModes;
    code: Byte[]; // code to overlay at address
    processed: boolean; // when false, needs label updates
    label: string; // label associated with line
    high: boolean; // for immediate, true when high address byte needed
}

export interface ICompilerResult {
    labels: ILabel[]; // distinct labels  
    memoryTags: number; // count of tags (includes label math: LDA MEMORY + 5)
    compiledLines: ICompiledLine[]; // actual compiled code
    lines: number; // total lines parsed
    bytes: number; // total bytes output (sum of code.length in lines)
    ellapsedTimeMilliseconds: number; // total time to compile
}

export const newCompiledLine = () => ({
    address: 0xC000,
    opCode: 0x00,
    code: [],
    mode: null,
    processed: false,
    label: '',
    high: false
} as ICompiledLine);

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
    while (lines && addr <= Memory.Size) {
        result.push(decompileOp(cpu, addr));
        addr += cpu.fetch(cpu.memory[addr]).size;
        lines -= 1;
    }
    return result;
};

export const dumpMemory = (cpu: ICpu, startAddress: Address, lines = 0x08) => {
    let addr = startAddress, result: string[] = [], count = lines;
    while (lines && addr < Memory.Size) {
        let dumpLine = `$${hexHelper(addr, 4)}: `;
        for (let offs = 0; offs < 0x10 && addr + offs < Memory.Size; offs += 1) {
            dumpLine += `${hexHelper(cpu.memory[addr + offs],2)} `;
        }
        result.push(dumpLine.trim());
        addr += 0x10;
        lines -= 1;
    }
    return result;
};
