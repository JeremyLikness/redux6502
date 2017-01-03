import { Address, Byte, AddressingModes } from '../cpu/globals';
import { Memory } from '../cpu/constants';

import { LABEL_NOT_DEFINED, OUT_OF_RANGE, NOT_IMPLEMENTED } from './constants';

import { ICompiledLine, ICompilerResult } from './globals';

export interface ILabel {
    address: Address;
    labelName: string;
    dependentLabelName?: string;
    offset: Byte;
}

export interface ILabelParseResult {
    parameter: string;
    compiledLine: ICompiledLine;
}

export const findLabel: (label: string, labels: ILabel[]) => ILabel = (label: string, labels: ILabel[]) => {
    let labelResult: ILabel = null;
    for (let idx = 0; idx < labels.length; idx += 1) {
        if (labels[idx].labelName === label && labels[idx].dependentLabelName === undefined) {
            return labels[idx];
        }
    }
    return null;
};

export const parseAbsoluteLabel = (
    parameter: string,
    compiledLine: ICompiledLine,
    labels: ILabel[],
    targetExpr: RegExp,
    labelExpr: RegExp) => {
        let result = {
            parameter,
            compiledLine: Object.assign({}, compiledLine)
        };
        let matchArray: RegExpMatchArray = null;
        if (!parameter.match(targetExpr)) {
            if (matchArray = parameter.match(labelExpr)) {
                let label: string = matchArray[1],
                    labelInstance: ILabel = findLabel(label, labels);
                if (labelInstance !== null) {
                    let value: Address = labelInstance.address;
                    result.parameter = parameter.replace(matchArray[1], value.toString(10));
                } else {
                    result.compiledLine.label = label;
                    result.compiledLine.processed = false;
                    result.parameter = parameter.replace(matchArray[1], '65535');
                }
            }
        }
        return result;
};

export const updateLabels = (compilerResult: ICompilerResult) => {
    let result = Object.assign({}, compilerResult, {
        labels: [...compilerResult.labels],
        compiledLines: [...compilerResult.compiledLines]
    });

    for (let idx = 0; idx < result.labels.length; idx += 1) {
        let label = Object.assign({}, result.labels[idx]);
        result.labels[idx] = label;
    }

    for (let idx = 0; idx < result.compiledLines.length; idx += 1) {

        let compiledLine = Object.assign({}, result.compiledLines[idx]);
        result.compiledLines[idx] = compiledLine;

        if (compiledLine.processed) {
            continue;
        }

        let instance = findLabel(compiledLine.label, result.labels);

        if (instance === null) {
            throw new Error(`${LABEL_NOT_DEFINED} ${compiledLine.label}`);
        }

        // relative or immediate
        if (compiledLine.code.length === 2) {
            // BMI MYLABEL
            if (compiledLine.mode === AddressingModes.Relative) {
                let offset: number;
                if (instance.address <= compiledLine.address) {
                    offset = Memory.ByteMask - ((compiledLine.address + 1) - instance.address);
                } else {
                    offset = (instance.address - compiledLine.address) - 2;
                }
                if (offset < 0x00 || offset > 0xFF) {
                    throw new Error(`${OUT_OF_RANGE} ${offset}`);
                }
                compiledLine.code[1] = offset;
            } else {
                // LDA <MYLABEL <-- get lower byte of MYLABEL address 
                let value = compiledLine.high ? (instance.address >> Memory.BitsInByte) : instance.address;
                compiledLine.code[1] = value & Memory.ByteMask;
            }
            compiledLine.processed = true;
            continue;
        }

        // absolute mode
        if (compiledLine.code.length === 3) {
            compiledLine.code[1] = instance.address & Memory.ByteMask; // lo byte
            compiledLine.code[2] = (instance.address >> Memory.BitsInByte) & Memory.ByteMask; // hi byte
            compiledLine.processed = true;
            continue;
        }

        throw new Error(NOT_IMPLEMENTED);
    }

    return result;
};
