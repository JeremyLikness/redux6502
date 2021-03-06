import { Memory, HALT } from './constants';

import { Cpu, initialCpuState, cloneCpu } from './cpuState';

import { Actions, IPokeAction, IRunAction, ISetPCAction } from './actions.cpu';

import { Action } from 'redux';

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
        const now = new Date(),
            diff = (now.getTime() - cpu.stats.started.getTime());
        cpu.stats.ellapsedMilliseconds = diff;
        cpu.stats.instructionsPerSecond = cpu.stats.instructionCount / (diff / 1000);
    }
};

export const cpuReducer: (state: Cpu, action: Action) => Cpu =
    (state: Cpu, action: Action) => {
        switch (action.type) {

            case Actions.SetPC:
                const setCpu = cloneCpu(state),
                    setAction = action as ISetPCAction;
                setCpu.rPC = setAction.address & Memory.Max;
                return setCpu;

            case Actions.Poke:
                const pokeCpu = cloneCpu(state),
                    pokeAction = action as IPokeAction;
                poke(pokeCpu, pokeAction.address, pokeAction.value);
                return pokeCpu;

            case Actions.Halt:
                const haltCpu = cpuReducer(state, {
                    type: Actions.Stop
                });
                haltCpu.controls.errorState = true;
                haltCpu.controls.errorMessage = HALT;
                return haltCpu;

            case Actions.Reset:
                return initialCpuState();

            case Actions.Start:
                const startCpu = cloneCpu(state);
                if (startCpu.controls.runningState || startCpu.controls.errorState) {
                    return startCpu;
                }
                startCpu.controls.runningState = true;
                startCpu.stats.instructionCount = 0;
                startCpu.stats.lastCheck = 0;
                startCpu.stats.started = new Date();
                return startCpu;

            case Actions.Step:
                const stepCpu = cloneCpu(state);
                if (state.controls.errorState === true || state.controls.runningState === false) {
                    return stepCpu;
                }
                step(stepCpu);
                timelapse(stepCpu);
                return stepCpu;

            case Actions.Run:
                const runCpu = cloneCpu(state),
                    runAction = action as IRunAction;
                let iterations = runAction.iterations;
                while (runCpu.controls.errorState === false && runCpu.controls.runningState === true && iterations) {
                    step(runCpu);
                    iterations -= 1;
                }
                timelapse(runCpu);
                return runCpu;

            case Actions.Stop:
                const stopCpu = cloneCpu(state);
                stopCpu.controls.runningState = false;
                return stopCpu;

            case Actions.Debug:
                const debugCpu = cloneCpu(state);
                debugCpu.debug = true;
                return debugCpu;

            default:
                return initialCpuState();
        }

    };
