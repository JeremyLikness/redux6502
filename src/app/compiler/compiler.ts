
import { ICompiledLine, ICompilerResult, ILabel } from './globals';
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
import { Memory } from '../cpu/constants';
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
            opCodeName: string = matches[1];

        let operations = this._map[opCodeName];

        if (operations === undefined && opCodeName !== DCB) {
            throw new Error(`${INVALID_OP_NAME}${opCodeName}`);
        }

        let parameter = opCodeExpression.replace(opCodeName, '').trim();

        if (opCodeName === DCB) {
            return this.processDcb(parameter, compiledLine);
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

}
