
import { ICompiledLine, ICompilerResult } from './globals';
import {
    ILabel,
    parseAbsoluteLabel,
    parseLabelMath,
    findLabel,
    resolveLabels,
    updateLabels
} from './labels';

import {
    CompilerPatterns,
    INVALID_OP_NAME,
    DCB,
    INVALID_DCB,
    INVALID_DCB_LIST,
    INVALID_DCB_RANGE,
    INVALID_ASSEMBLY,
    INVALID_BRANCH,
    OUT_OF_RANGE,
    REQUIRES_PARAMETER,
    INDXINDRX_OUT_OF_RANGE,
    NO_INDXINDRX_SUPPORT,
    DUPLICATE_LABEL
} from './constants';

import { OP_CODES } from '../cpu/opCodeBridge';
import { IOpCode, AddressingModes, Address, Byte } from '../cpu/globals';
import { Memory, BIT } from '../cpu/constants';
import { Cpu, initialCpuState } from '../cpu/cpuState';

interface AddressMap { [ addressMode: number]: IOpCode; };

interface OpCodeMap { [opCodeName: string]: AddressMap; };

export const moveAddress = (input: string) => {
    let address: Address = null;

    if (input.match(CompilerPatterns.memorySet)) {

        let parameter = input.replace(CompilerPatterns.setAddress, '').trim();

        if (parameter[0] === '$') {
            parameter = parameter.replace('$', '');
            address = parseInt(parameter, 16);
        } else {
            address = parseInt(parameter, 10);
        }

        if (address < 0 || address > Memory.Max) {
            throw new Error(`${OUT_OF_RANGE} ${address}`);
        }
    }

    return address;
};

export class Compiler {

    private _cpu: Cpu;
    private _pcAddress: Address;
    private _map: OpCodeMap = {};

    constructor() {

        this._cpu = initialCpuState();

        OP_CODES.forEach(family => {
            family.codes.forEach(code => {
                let operation = family.fetch(this._cpu, code);
                if (!this._map[operation.name]) {
                    this._map[operation.name] = {};
                }
                this._map[operation.name][operation.mode] = operation;
            });
        });
    }

    public compileAndParseLabels(sourceLines: string[]): ICompilerResult {
        let result: ICompilerResult = {
            labels: [],
            memoryTags: 0,
            compiledLines: [],
            lines: 0,
            bytes: 0,
            ellapsedTimeMilliseconds: 0
        };
        let address = Memory.DefaultStart;
        for (let idx = 0; idx < sourceLines.length; idx += 1) {

            try {
                let input = sourceLines[idx].toUpperCase();

                // get rid of comments
                if (input.indexOf(';') >= 0) {
                    input = input.split(';')[0];
                }

                input = input.trim();

                // skip empty lines
                if (!input.match(CompilerPatterns.notWhitespace)) {
                    continue;
                }

                result.lines += 1;

                // check if the address is being moved
                let testAddress = moveAddress(input);

                if (testAddress) {
                    address = testAddress;
                    continue;
                }

                // label math 
                if (input.match(CompilerPatterns.labelMath)) {
                    result.labels.push(parseLabelMath(input, result.labels));
                    continue;
                }

                // memory tag, i.e. $C000: LDA #$00 <-- go to 49152
                let hex = !!input.match(CompilerPatterns.memoryLabelHex);
                if (hex || input.match(CompilerPatterns.memoryLabelDec)) {
                    result.memoryTags += 1;
                    let label = hex ? CompilerPatterns.memoryLabelHex.exec(input)[1] :
                        CompilerPatterns.memoryLabelDec.exec(input)[1];

                    // strip out the label
                    input = input.replace(`${label}:`, '');
                    label = label.replace('$', '');
                    let checkAddress = parseInt(label, hex ? 16 : 10);

                    if (checkAddress < 0 || checkAddress > Memory.Max) {
                        throw new Error (`${OUT_OF_RANGE} ${label}`);
                    }

                    address = checkAddress;
                } else if (input.match(CompilerPatterns.regularLabel)) {
                    let labelName = CompilerPatterns.regularLabel.exec(input)[1].trim();
                    if (findLabel(labelName, result.labels)) {
                        throw new Error (`${DUPLICATE_LABEL} ${labelName}`);
                    }
                    result.labels.push(<ILabel>{
                        address,
                        labelName,
                        offset: 0
                    });
                    input = input.replace(`${labelName}:`, '');
                }

                // blank after label stripped?
                if (!input.match(CompilerPatterns.notWhitespace)) {
                    continue;
                }

                let compiledLine = this.compileLine(result, address, input);
                console.log(compiledLine);
                result.compiledLines.push(compiledLine);
                address += compiledLine.code.length;
                result.bytes += compiledLine.code.length;
            } catch (e) {
                throw new Error(`${e} at line: ${idx + 1}`);
            }
        }

        result.labels = resolveLabels(result.labels);

        return updateLabels(result);
    }

    private compileLine(compilerResult: ICompilerResult, address: Address, input: string): ICompiledLine {
        let result = <ICompiledLine>{
            address,
            code: [],
            opCode: null,
            processed: false,
            label: '',
            high: false
        };

        if (input.match(CompilerPatterns.opCode)) {
            return this.parseOpCode(compilerResult.labels, input, result);
        }

        throw new Error(`${INVALID_ASSEMBLY} ${input}`);
    }

    public parseOpCode(labels: ILabel[], opCodeExpression: string, compiledLine: ICompiledLine): ICompiledLine {

        let matches: RegExpExecArray = CompilerPatterns.opCode.exec(opCodeExpression),
            opCodeName: string = matches[1],
            operations = this._map[opCodeName],
            radix = 10,
            processed = true;

        if (operations === undefined && opCodeName !== DCB) {
            throw new Error(`${INVALID_OP_NAME}${opCodeName}`);
        }

        let parameter = opCodeExpression.replace(opCodeName, '').trim();

        if (opCodeName === DCB) {
            return this.processDcb(parameter, compiledLine);
        }

        let hex = parameter.indexOf('$') >= 0;

        if (hex) {
            parameter = parameter.replace('$', '');
            radix = 16;
        }

        if (opCodeName[0] === 'B' && opCodeName !== BIT) {
            return this.processBranch(opCodeName, parameter, labels, radix, compiledLine, hex);
        }

        if (!parameter.match(CompilerPatterns.notWhitespace)) {
            return this.processSingle(opCodeName, compiledLine);
        }

        let matchArray: RegExpMatchArray;

        let idxIndrXTest = hex ? CompilerPatterns.indirectXHex : CompilerPatterns.indirectX;

        if (matchArray = parameter.match(idxIndrXTest)) {
            return this.processIndexedIndirectX(matchArray, opCodeName, radix, parameter, compiledLine);
        }

        throw new Error(`${INVALID_ASSEMBLY} ${opCodeExpression}`);
    }

    private processIndexedIndirectX(
        matchArray: RegExpMatchArray,
        opCodeName: string,
        radix: number,
        parameter: string,
        compiledLine: ICompiledLine): ICompiledLine {
            let result = Object.assign({}, compiledLine),
                rawValue = matchArray[1],
                xIndex = matchArray[2],
                value = parseInt(rawValue, radix);

            if (value < 0 || value > Memory.ByteMask) {
                throw new Error(`${INDXINDRX_OUT_OF_RANGE} ${value}`);
            }

            let parms = parameter.replace('(', '')
                .replace(')', '')
                .replace(xIndex, '')
                .replace(rawValue, '')
                .trim();

            if (parms.match(CompilerPatterns.notWhitespace)) {
                throw new Error(`${INVALID_ASSEMBLY} ${parameter}`);
            }

            let operation = this._map[opCodeName][AddressingModes.IndexedIndirectX];

            if (operation === undefined) {
                throw new Error(`${opCodeName} ${NO_INDXINDRX_SUPPORT} ${parameter}`);
            }

            result.opCode = operation.value;
            result.mode = AddressingModes.IndexedIndirectX;
            result.code.push(result.opCode);
            result.code.push(value);
            result.processed = true;

            return result;
    }

    private processSingle(opCodeName: string, compiledLine: ICompiledLine): ICompiledLine {
        let result = Object.assign({}, compiledLine),
            operation = this._map[opCodeName][AddressingModes.Single];
        if (operation === undefined) {
            throw new Error(`${REQUIRES_PARAMETER} ${opCodeName}`);
        }
        result.opCode = operation.value;
        result.mode = AddressingModes.Single;
        result.code.push(result.opCode);
        result.processed = true;
        return result;
    }

    private processDcb(parameter: string, compiledLine: ICompiledLine): ICompiledLine {
        if (parameter === '') {
            throw new Error(INVALID_DCB);
        }

        let compiledLineResult = Object.assign({}, compiledLine);

        compiledLineResult.processed = true;
        compiledLineResult.opCode = 0x0;

        let values = parameter.split(',');

        if (values.length === 0) {
            throw new Error(INVALID_DCB);
        }
        for (let idx = 0; idx < values.length; idx++) {

            if (values[idx] === undefined || values[idx] === null || values[idx].length === 0) {
                throw new Error(`${INVALID_DCB_LIST}${parameter}`);
            }
            let value: Byte = 0x0;
            let entry = values[idx];
            let hex = entry.indexOf('$') >= 0;
            if (hex) {
                entry = entry.replace('$', '');
                value = parseInt(entry, 16);
            } else {
                value = parseInt(entry, 10);
            }
            if (value < 0 || value > Memory.ByteMask) {
                throw new Error(`${INVALID_DCB_RANGE}${parameter}`);
            }
            compiledLineResult.code.push(value);
        }
        return compiledLineResult;
    }

    private processBranch(
        opCodeName: string,
        parameter: string,
        labels: ILabel[],
        radix: number,
        compiledLine: ICompiledLine,
        hex: boolean): ICompiledLine {

            let compiledLineResult = Object.assign({}, compiledLine),

            test = hex ? CompilerPatterns.absoluteHex : CompilerPatterns.absolute;

            compiledLineResult.processed = true;

            let result = parseAbsoluteLabel(
                parameter,
                compiledLineResult,
                labels,
                test,
                CompilerPatterns.absoluteLabel),

            matchArray: RegExpMatchArray;

            // absolute 
            if (matchArray = result.parameter.match(test)) {

                let rawValue = matchArray[1],
                value = parseInt(rawValue, radix);
                if (value < 0 || value > Memory.Max) {
                    throw new Error(`${OUT_OF_RANGE} ${value}`);
                }

                result.parameter = result.parameter.replace(rawValue, '').trim();

                if (result.parameter.match(CompilerPatterns.notWhitespace)) {
                    throw new Error(`${INVALID_ASSEMBLY} ${parameter}`);
                }

                result.compiledLine.opCode = this._map[opCodeName][AddressingModes.Relative].value;
                result.compiledLine.mode = AddressingModes.Relative;
                result.compiledLine.code.push(result.compiledLine.opCode);

                let offset: number;

                if (value <= compiledLine.address) {
                    offset = Memory.ByteMask - ((compiledLine.address + 1) - value);
                    if (offset < 0x80 || offset > 0xFF) {
                        throw new Error(`${OUT_OF_RANGE} ${value}`);
                    }
                } else {
                    offset = (value - compiledLine.address) - 2;
                    if (offset < 0 || offset > 0x7F) {
                        throw new Error(`${OUT_OF_RANGE} ${value}`);
                    }
                }

                result.compiledLine.code.push(offset & Memory.ByteMask);
            } else {
                throw new Error(`${INVALID_BRANCH} ${parameter}`);
            }

            return result.compiledLine;
    }

}
