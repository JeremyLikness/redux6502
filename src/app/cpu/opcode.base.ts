import {
    Byte,
    AddressingModes,
    OpCodeValue,
    ICpu,
    IOpCode,
    IOpCodes
} from './globals';

import { INVALID } from './constants';

export class BaseOpCode implements IOpCode {

    private _execute: (cpu: ICpu) => void = cpu => {
        throw new Error('Not implemented!');
    }

    constructor(
        public name: string,
        public value: OpCodeValue,
        public mode: AddressingModes,
        public size: Byte,
        logic: (cpu: ICpu) => void) {
        this._execute = logic;
    }

    public execute(cpu: ICpu): void {
        this._execute(cpu);
    }
}

export class InvalidOpCode extends BaseOpCode {
    constructor(public value: OpCodeValue) {
        super(INVALID, value, AddressingModes.Single, 0x01, cpu => { });
    }
}

interface IOpCodeMap { [opCode: number]: IOpCode; };

export class OpCodeFamily implements IOpCodes {

    private _codeMap: IOpCodeMap = {};

    public codes: OpCodeValue[] = [];

    constructor(public name: string) { }

    public register(...ops: IOpCode[]) {
        ops.forEach(opCode => {
            this.codes.push(opCode.value);
            this._codeMap[opCode.value] = opCode;
        });
    }

    public fetch(cpu: ICpu, opCode: OpCodeValue): IOpCode {
        const operation = this._codeMap[opCode];
        if (operation !== undefined) {
            return operation;
        }
        return new InvalidOpCode(opCode);
    }

    public execute(cpu: ICpu, opCode: OpCodeValue) {
        const operation = this.fetch(cpu, opCode);
        if (operation.name !== INVALID) {
            operation.execute(cpu);
        } else {
            throw new Error(`Invalid op code ${opCode} for ${this.name} family.`);
        }
    }
}
