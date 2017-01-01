
import { ICompiledLine, ICompilerResult } from './globals';
import { ILabel } from './labels';

import {
    CompilerPatterns,
    INVALID_OP_NAME,
    DCB,
    INVALID_DCB,
    INVALID_DCB_LIST,
    INVALID_DCB_RANGE
} from './constants';

import { OP_CODES } from '../cpu/opCodeBridge';
import { IOpCode, Address, Byte } from '../cpu/globals';
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
            return this.processBranch(parameter, compiledLine, hex);
        }

        return compiledLine;
    }

    private processDcb(parameter: string, compiledLine: ICompiledLine): ICompiledLine {
        if (parameter === '') {
            throw new Error(INVALID_DCB);
        }

        compiledLine.processed = true;
        compiledLine.opCode = 0x0;

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
            compiledLine.code.push(value);
        }
        return compiledLine;
    }

    private processBranch(parameter: string, compiledLine: ICompiledLine, hex: boolean): ICompiledLine {
        return compiledLine;
    }

}
