
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
    INDINDXY_OUT_OF_RANGE,
    NO_INDXINDRY_SUPPORT,
    DUPLICATE_LABEL,
    IMMEDIATE_OUT_OF_RANGE,
    NO_IMMEDIATE_SUPPORT
} from './constants';

import { OP_CODES } from '../cpu/opCodeBridge';
import { IOpCode, AddressingModes, Address, Byte } from '../cpu/globals';
import { Memory, BIT } from '../cpu/constants';
import { Cpu, initialCpuState } from '../cpu/cpuState';

interface AddressMap { [ addressMode: number]: IOpCode; };

interface OpCodeMap { [opCodeName: string]: AddressMap; };

export const moveAddress = (input: string) => {
    let address: Address = null, method = 'Move Address:';

    if (input.match(CompilerPatterns.memorySet)) {

        let parameter = input.replace(CompilerPatterns.setAddress, '').trim();

        if (parameter[0] === '$') {
            parameter = parameter.replace('$', '');
            address = parseInt(parameter, 16);
        } else {
            address = parseInt(parameter, 10);
        }

        if (address < 0 || address > Memory.Max) {
            throw new Error(`${method} ${OUT_OF_RANGE} ${address}`);
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

    // compiles source and returns it in a structure that can be parsed
    // otherwise it throws an exception 
    public compile(source: string): ICompilerResult {
        let start = new Date();
        let sourceLines = source.split('\n');
        let result = this.compileAndParseLabels(sourceLines);
        let end = new Date();
        result.ellapsedTimeMilliseconds = end.getTime() - start.getTime();
        return result;
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
        let address = Memory.DefaultStart, method = 'Compile and Parse Labels:';
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
                        throw new Error (`${method} ${OUT_OF_RANGE} ${label}`);
                    }

                    address = checkAddress;
                } else if (input.match(CompilerPatterns.regularLabel)) {
                    let labelName = CompilerPatterns.regularLabel.exec(input)[1].trim();
                    if (findLabel(labelName, result.labels)) {
                        throw new Error (`${method} ${DUPLICATE_LABEL} ${labelName}`);
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
        }, method = 'Compile Single Line:';

        if (input.match(CompilerPatterns.opCode)) {
            return this.parseOpCode(compilerResult.labels, input, result);
        }

        throw new Error(`${method} ${INVALID_ASSEMBLY} ${input}`);
    }

    public parseOpCode(labels: ILabel[], opCodeExpression: string, compiledLine: ICompiledLine): ICompiledLine {

        let matches: RegExpExecArray = CompilerPatterns.opCode.exec(opCodeExpression),
            opCodeName: string = matches[1],
            operations = this._map[opCodeName],
            radix = 10,
            processed = true,
            method = 'Parse Individual Op Code:';

        if (operations === undefined && opCodeName !== DCB) {
            throw new Error(`${method} ${INVALID_OP_NAME}${opCodeName}`);
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
            return this.processIndexedIndirect(
                matchArray,
                opCodeName,
                radix,
                parameter,
                compiledLine,
                INDXINDRX_OUT_OF_RANGE,
                NO_INDXINDRX_SUPPORT,
                AddressingModes.IndexedIndirectX);
        }

        let indIdxYTest = hex ? CompilerPatterns.indirectYHex : CompilerPatterns.indirectY;

        if (matchArray = parameter.match(indIdxYTest)) {
            return this.processIndexedIndirect(
                matchArray,
                opCodeName,
                radix,
                parameter,
                compiledLine,
                INDINDXY_OUT_OF_RANGE,
                NO_INDXINDRY_SUPPORT,
                AddressingModes.IndirectIndexedY);
        }

        let immediateWithoutLabelTest = hex ? CompilerPatterns.immediateHex : CompilerPatterns.immediate;

        let compiledLineResult = Object.assign({}, compiledLine);

        // if it matches, parse the label into an immediate value or #0 for later replacement
        if (!parameter.match(immediateWithoutLabelTest)) {
            if (matchArray = parameter.match(CompilerPatterns.immediateLabel)) {
                compiledLineResult.high = matchArray[1] === '>';
                let label = matchArray[2];
                let instance = findLabel(label, labels);
                if (instance !== null) {
                    let value = compiledLineResult.high ? (instance.address >> Memory.BitsInByte) : instance.address;
                    parameter = parameter.replace(matchArray[0], '#' + (value & Memory.ByteMask).toString(10));
                } else {
                    compiledLineResult.label = label;
                    processed = false;
                    parameter = parameter.replace(matchArray[0], '#0');
                }
            }
        }

        // any label above for immediate will get picked up here
        if (matchArray = parameter.match(immediateWithoutLabelTest)) {
            let rawValue = matchArray[1];
            let value = parseInt(rawValue, radix);
            if (value < 0 || value > Memory.ByteMask) {
                throw new Error(`${IMMEDIATE_OUT_OF_RANGE} ${value}`);
            }
            parameter = parameter.replace('#', '');
            parameter = parameter.replace(rawValue, '').trim();
            if (parameter.match(CompilerPatterns.notWhitespace)) {
                throw new Error(`${INVALID_ASSEMBLY} ${opCodeExpression}`);
            }

            let operationMap = this._map[opCodeName];

            if (operationMap === undefined) {
                throw new Error(`${INVALID_ASSEMBLY} ${opCodeExpression}`);
            }

            let operation = operationMap[AddressingModes.Immediate];

            if (operation === undefined) {
                throw new Error(`${NO_IMMEDIATE_SUPPORT} ${opCodeName}`);
            }

            compiledLineResult.code.push(operation.value);
            compiledLineResult.code.push(value);
            compiledLineResult.processed = processed;
            return compiledLineResult;
        }

        throw new Error(`${method} ${INVALID_ASSEMBLY} ${opCodeExpression}`);
    }

    private processIndexedIndirect(
        matchArray: RegExpMatchArray,
        opCodeName: string,
        radix: number,
        parameter: string,
        compiledLine: ICompiledLine,
        outOfRange: string,
        noSupport: string,
        mode: AddressingModes): ICompiledLine {
            let result = Object.assign({}, compiledLine),
                rawValue = matchArray[1],
                index = matchArray[2],
                value = parseInt(rawValue, radix),
                method = 'Process Indexed Indirect:';

            if (value < 0 || value > Memory.ByteMask) {
                throw new Error(`${method} ${outOfRange} ${value}`);
            }

            let parms = parameter.replace('(', '')
                .replace(')', '')
                .replace(index, '')
                .replace(rawValue, '')
                .trim();

            if (parms.match(CompilerPatterns.notWhitespace)) {
                throw new Error(`${method} ${INVALID_ASSEMBLY} ${parameter}`);
            }

            let operation = this._map[opCodeName][mode];

            if (operation === undefined) {
                throw new Error(`${method} ${opCodeName} ${noSupport} ${parameter}`);
            }

            result.opCode = operation.value;
            result.mode = mode;
            result.code.push(result.opCode);
            result.code.push(value);
            result.processed = true;

            return result;
    }

    private processSingle(opCodeName: string, compiledLine: ICompiledLine): ICompiledLine {
        let result = Object.assign({}, compiledLine),
            operation = this._map[opCodeName][AddressingModes.Single],
            method = 'Process Single Op Code:';
        if (operation === undefined) {
            throw new Error(`${method} ${REQUIRES_PARAMETER} ${opCodeName}`);
        }
        result.opCode = operation.value;
        result.mode = AddressingModes.Single;
        result.code.push(result.opCode);
        result.processed = true;
        return result;
    }

    private processDcb(parameter: string, compiledLine: ICompiledLine): ICompiledLine {
        let method = 'Process Bytes (DCB):';

        if (parameter === '') {
            throw new Error(`${method} ${INVALID_DCB}`);
        }

        let compiledLineResult = Object.assign({}, compiledLine);

        compiledLineResult.processed = true;
        compiledLineResult.opCode = 0x0;

        let values = parameter.split(',');

        if (values.length === 0) {
            throw new Error(`${method} ${INVALID_DCB}`);
        }
        for (let idx = 0; idx < values.length; idx++) {

            if (values[idx] === undefined || values[idx] === null || values[idx].length === 0) {
                throw new Error(`${method} ${INVALID_DCB_LIST}${parameter}`);
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
                throw new Error(`${method} ${INVALID_DCB_RANGE}${parameter}`);
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
            test = hex ? CompilerPatterns.absoluteHex : CompilerPatterns.absolute,
            method = 'Process Branch Op Code:';

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
                    throw new Error(`${method} ${OUT_OF_RANGE} ${value}`);
                }

                result.parameter = result.parameter.replace(rawValue, '').trim();

                if (result.parameter.match(CompilerPatterns.notWhitespace)) {
                    throw new Error(`${method} ${INVALID_ASSEMBLY} ${parameter}`);
                }

                result.compiledLine.opCode = this._map[opCodeName][AddressingModes.Relative].value;
                result.compiledLine.mode = AddressingModes.Relative;
                result.compiledLine.code.push(result.compiledLine.opCode);

                let offset: number, validate = result.compiledLine.processed;

                if (value <= compiledLine.address) {
                    offset = Memory.ByteMask - ((compiledLine.address + 1) - value);
                    if (validate && (offset < 0x80 || offset > 0xFF)) {
                        throw new Error(`${method} ${OUT_OF_RANGE} ${value}`);
                    }
                } else {
                    offset = (value - compiledLine.address) - 2;
                    if (validate && (offset < 0 || offset > 0x7F)) {
                        throw new Error(`${method} ${OUT_OF_RANGE} ${value}`);
                    }
                }

                result.compiledLine.code.push(offset & Memory.ByteMask);
            } else {
                throw new Error(`${method} ${INVALID_BRANCH} ${parameter}`);
            }

            return result.compiledLine;
    }

}
