import {
    Byte,
    AddressingModes,
    OpCodeValue,
    ICpu,
    IOpCode,
    IOpCodes
} from './globals';

export class BaseOpCode implements IOpCode {

    private _execute: (cpu: ICpu) => void = cpu => {
        throw new Error('Not implemented!');
    }

    constructor(
        public name: string,
        public value: Byte,
        public mode: AddressingModes,
        public size: Byte,
        logic: (cpu: ICpu) => void) {
            this._execute = logic;
         }

    public execute(cpu: ICpu): void {
        this._execute(cpu);
    }
}

interface IOpCodeMap { [opCode: number]: IOpCode; };

export class OpCodeFamily implements IOpCodes {

    private _codeMap: IOpCodeMap = {};

    public codes: OpCodeValue[] = [];

    constructor(public name: string) {}

    public register(...ops: IOpCode[]) {
        ops.forEach(opCode => {
            this.codes.push(opCode.value);
            this._codeMap[opCode.value] = opCode;
        });
    }

    public execute(cpu: ICpu, opCode: OpCodeValue) {
        let operation = this._codeMap[opCode];
        if (operation !== undefined) {
            operation.execute(cpu);
        } else {
            throw new Error(`Invalid op code ${opCode} for ${this.name} family.`);
        }
    }
}
