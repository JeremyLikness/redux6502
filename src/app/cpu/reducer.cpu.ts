import { Memory } from './constants';

import { Cpu, initialCpuState, cloneCpu } from './cpuState';

import { Actions, IAction, IPokeAction, IRunAction, ISetPCAction } from './actions.cpu';

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

const timelapse = (cpu: Cpu) => {
    if (cpu.stats.started) {
        let now = new Date(),
        diff = (now.getTime() - cpu.stats.started.getTime());
        cpu.stats.ellapsedMilliseconds = diff;
        cpu.stats.instructionsPerSecond = cpu.stats.instructionCount / (diff / 1000);
    }
};

export const cpuReducer: (state: Cpu, action: IAction | IPokeAction | IRunAction | ISetPCAction) => Cpu =
    (state: Cpu, action: IAction | IPokeAction | IRunAction | ISetPCAction) => {
    switch (action.type) {

        case Actions.SetPC:
            let setCpu = cloneCpu(state),
                setAction = action as ISetPCAction;
            setCpu.rPC = setAction.address & Memory.Max;
            return setCpu;

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

        case Actions.Start:
            let startCpu = cloneCpu(state);
            if (startCpu.controls.runningState || startCpu.controls.errorState) {
                return startCpu;
            }
            startCpu.controls.runningState = true;
            startCpu.stats.instructionCount = 0;
            startCpu.stats.lastCheck = 0;
            startCpu.stats.started = new Date();
            return startCpu;

        case Actions.Step:
            let stepCpu = cloneCpu(state);
            if (state.controls.errorState === true || state.controls.runningState === false) {
                return stepCpu;
            }
            step(stepCpu);
            timelapse(stepCpu);
            return stepCpu;

        case Actions.Run:
            let runCpu = cloneCpu(state),
                runAction = action as IRunAction,
                iterations = runAction.iterations;
            while (runCpu.controls.errorState === false && runCpu.controls.runningState === true && iterations) {
                step(runCpu);
                iterations -= 1;
            }
            timelapse(runCpu);
            return runCpu;

        case Actions.Stop:
            let stopCpu = cloneCpu(state);
            stopCpu.controls.runningState = false;
            return stopCpu;

        case Actions.Debug:
            let debugCpu = cloneCpu(state);
            debugCpu.debug = true;
            return debugCpu;

        default:
            return initialCpuState();
    }

};
