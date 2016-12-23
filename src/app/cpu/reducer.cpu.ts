import { Memory } from './constants';

import { Cpu, initialCpuState, cloneCpu } from './cpuState';

import { Actions, IAction, IPokeAction } from './actions.cpu';

export const cpuReducer = (state: Cpu, action: IAction | IPokeAction) => {

    switch (action.type) {

        case Actions.Poke:
            let pokeCpu = cloneCpu(state),
                pokeAction = action as IPokeAction;
            pokeCpu.memory[pokeAction.address & Memory.Max] = (pokeAction.value & Memory.ByteMask);
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
            try {
                stepCpu.execute();
            } catch (ex) {
                stepCpu.controls.errorState = true;
                stepCpu.controls.runningState = false;
                stepCpu.controls.errorMessage = (<Error>ex).message;
            }
            return stepCpu;

        case Actions.Stop:
            let stopCpu = cloneCpu(state);
            stopCpu.controls.runningState = false;
            return stopCpu;

        default:
            return initialCpuState();
    }

};
