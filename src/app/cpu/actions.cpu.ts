import { Address, Byte } from './globals';
import { Action } from 'redux';

export enum Actions {
    SetPC,
    Poke,
    Start,
    Stop,
    Halt,
    Reset,
    Step,
    Run,
    Debug
}


export interface ISetPCAction extends Action {
    address: Address;
}

export interface IPokeAction extends Action {
    address: Address;
    value: Byte[];
}

export interface IRunAction extends Action {
    iterations: number;
}

export const cpuPoke = (address: Address, value: Byte[]) => ({
    type: Actions.Poke,
    address,
    value
} as IPokeAction);

export const cpuSetPC = (address: Address) => ({
    type: Actions.SetPC,
    address
});

export const cpuRun = (iterations: number) => ({
    type: Actions.Run,
    iterations
} as IRunAction);

const simpleAction = (action: Actions) => ({
    type: action
} as Action);

export const cpuDebug = () => simpleAction(Actions.Debug);
export const cpuStop = () => simpleAction(Actions.Stop);
export const cpuHalt = () => simpleAction(Actions.Halt);
export const cpuReset = () => simpleAction(Actions.Reset);
export const cpuStep = () => simpleAction(Actions.Step);
export const cpuStart = () => simpleAction(Actions.Start);

