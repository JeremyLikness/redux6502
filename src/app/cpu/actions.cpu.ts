import { Address, Byte } from './globals';

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

export interface IAction {
    type: Actions;
}

export interface ISetPCAction extends IAction {
    address: Address;
}

export interface IPokeAction extends IAction {
    address: Address;
    value: Byte[];
}

export interface IRunAction extends IAction {
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
} as IAction);

export const cpuDebug = () => simpleAction(Actions.Debug);
export const cpuStop = () => simpleAction(Actions.Stop);
export const cpuHalt = () => simpleAction(Actions.Halt);
export const cpuReset = () => simpleAction(Actions.Reset);
export const cpuStep = () => simpleAction(Actions.Step);
export const cpuStart = () => simpleAction(Actions.Start);

