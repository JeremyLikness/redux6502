import { Memory } from './constants';

import { Cpu, initialCpuState, cloneCpu } from './cpuState';

import { Actions, IAction, IPokeAction, IRunAction } from './actions.cpu';

import { poke } from './globals';

const step = (cpu: Cpu) => {
    try {
        cpu.execute();
        cpu.stats.instructionCount += 1;
    } catch (ex) {
        cpu.controls.errorState = true;
        cpu.controls.runningState = false;
        cpu.controls.errorMessage = (<Error>ex).message;
    }
};

export const cpuReducer = (state: Cpu, action: IAction | IPokeAction | IRunAction) => {

    switch (action.type) {

        case Actions.Poke:
            let pokeCpu = cloneCpu(state),
                pokeAction = action as IPokeAction;
            poke(pokeCpu, pokeAction.address, pokeAction.value);
            return pokeCpu;

        case Actions.Halt:
            let haltCpu = cpuReducer(state, {
                type: Actions.Stop
            });
            haltCpu.controls.errorState = true;
            return haltCpu;

        case Actions.Reset:
            return initialCpuState();

        case Actions.Step:
            let stepCpu = cloneCpu(state);
            if (state.controls.errorState === true || state.controls.runningState === false) {
                return stepCpu;
            }
            step(stepCpu);
            return stepCpu;

        case Actions.Run:
            let runCpu = cloneCpu(state),
                runAction = action as IRunAction,
                iterations = runAction.iterations;
            while (runCpu.controls.errorState === false && runCpu.controls.runningState === true && iterations) {
                step(runCpu);
                iterations -= 1;
            }
            return runCpu;

        case Actions.Stop:
            let stopCpu = cloneCpu(state);
            stopCpu.controls.runningState = false;
            return stopCpu;

        default:
            return initialCpuState();
    }

};
