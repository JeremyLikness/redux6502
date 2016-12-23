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

interface IOpCodeMap { [mode: number]: IOpCode; };
interface IModeMap { [opCode: number]: AddressingModes; }

export class OpCodeFamily implements IOpCodes {

    private _codeMap: IOpCodeMap = {};
    private _modeMap: IModeMap = {};

    public codes: OpCodeValue[] = [];

    constructor(public name: string) {}

    public register(...ops: IOpCode[]) {
        ops.forEach(opCode => {
            if (opCode.name !== this.name) {
                throw new Error(`Cannot register op code ${opCode.name} with family ${this.name}`);
            }
            this.codes.push(opCode.value);
            this._codeMap[opCode.mode] = opCode;
            this._modeMap[opCode.value] = opCode.mode;
        });
    }

    public execute(cpu: ICpu, opCode: OpCodeValue) {
        let mode = this._modeMap[opCode];
        if (mode !== undefined) {
            this._codeMap[mode].execute(cpu);
        } else {
            throw new Error(`Invalid op code for ${this.name} family.`);
        }
    }
}
