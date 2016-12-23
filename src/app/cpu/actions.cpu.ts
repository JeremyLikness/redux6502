export enum Actions {
    Poke,
    Stop,
    Halt,
    Reset,
    Step,
    Run
}

export interface IAction {
    type: Actions;
}

export interface IPokeAction extends IAction {
    address: number;
    value: number;
}

export interface IRunAction extends IAction {
    iterations: number;
}

export const cpuPoke = (address: number, value: number) => ({
    type: Actions.Poke,
    address,
    value
} as IPokeAction);

export const cpuRun = (iterations: number) => ({
    type: Actions.Run,
    iterations
} as IRunAction);

const simpleAction = (action: Actions) => ({
    type: action
} as IAction);

export const cpuStop = () => simpleAction(Actions.Stop);
export const cpuHalt = () => simpleAction(Actions.Halt);
export const cpuReset = () => simpleAction(Actions.Reset);
export const cpuStep = () => simpleAction(Actions.Step);

