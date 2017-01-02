
import { ICompiledLine, ICompilerResult } from './globals';
import { ILabel, parseAbsoluteLabel } from './labels';

import {
    CompilerPatterns,
    INVALID_OP_NAME,
    DCB,
    INVALID_DCB,
    INVALID_DCB_LIST,
    INVALID_DCB_RANGE,
    INVALID_ASSEMBLY,
    INVALID_BRANCH,
    OUT_OF_RANGE
} from './constants';

import { OP_CODES } from '../cpu/opCodeBridge';
import { IOpCode, AddressingModes, Address, Byte } from '../cpu/globals';
import { Memory, BIT } from '../cpu/constants';
import { Cpu, initialCpuState } from '../cpu/cpuState';

interface AddressMap { [ addressMode: number]: IOpCode; };

interface OpCodeMap { [opCodeName: string]: AddressMap; };

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

        return compiledLine;
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
                result.compiledLine.code.push(result.compiledLine.opCode);

                let offset: number;

                if (value <= compiledLine.address) {
                    offset = Memory.ByteMask - ((compiledLine.address + 1) - value);
                    console.log(offset);
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
