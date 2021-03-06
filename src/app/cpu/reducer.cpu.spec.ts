import { Actions, IRunAction, IPokeAction, ISetPCAction } from './actions.cpu';

import { Memory, INVALID_OP, HALT } from './constants';

import { Cpu, initialCpuState, cloneCpu } from './cpuState';

import { cpuReducer } from './reducer.cpu';

import { TestBed } from '@angular/core/testing';

const freezeCpu = (cpu: Cpu) => {
    Object.freeze(cpu);
    Object.freeze(cpu.memory);
    Object.freeze(cpu.stats);
    Object.freeze(cpu.controls);
};

describe('reducer', () => {

    let defaultCpu: Cpu = null;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [
                cpuReducer
            ],
        });

        defaultCpu = initialCpuState();
    });

    it('should handle initial state', () => {
        expect(cpuReducer(undefined, { type: undefined })).toEqual(defaultCpu);
    });

    it('should handle debug by setting debug to true', () => {
        const expected: Cpu = cloneCpu(defaultCpu);
        expected.debug = true;

        freezeCpu(defaultCpu);

        expect(cpuReducer(defaultCpu, {
            type: Actions.Debug
        })).toEqual(expected);
    });

    it('should handle stop by setting runningState to false', () => {

        const expected: Cpu = cloneCpu(defaultCpu);
        defaultCpu.controls.runningState = true;

        freezeCpu(defaultCpu);

        expect(cpuReducer(defaultCpu, {
            type: Actions.Stop
        })).toEqual(expected);
    });

    it('should handle reset by initializing the CPU', () => {

        const expected: Cpu = initialCpuState();

        defaultCpu.controls.runningState = true;
        defaultCpu.memory[5] = 6;

        freezeCpu(defaultCpu);

        expect(cpuReducer(defaultCpu, {
            type: Actions.Reset
        })).toEqual(expected);
    });

    it('should handle halt by setting runningState to false and errorState to true', () => {

        const expected: Cpu = initialCpuState();
        expected.controls.runningState = false;
        expected.controls.errorState = true;
        expected.controls.errorMessage = HALT;

        defaultCpu.controls.runningState = true;

        freezeCpu(defaultCpu);

        expect(cpuReducer(defaultCpu, {
            type: Actions.Halt
        })).toEqual(expected);
    });

    describe('step', () => {

        it('should do nothing if not in a running state', () => {
            expect(cpuReducer(defaultCpu, {
                type: Actions.Step
            })).toEqual(defaultCpu);
        });

        it('should catch exceptions and set the error state', () => {
            const expected: Cpu = initialCpuState();
            expected.rPC += 1;
            expected.controls.errorState = true;
            expected.controls.errorMessage = INVALID_OP + ' (0)';
            defaultCpu.controls.runningState = true;
            freezeCpu(defaultCpu);
            expect(cpuReducer(defaultCpu, {
                type: Actions.Step
            })).toEqual(expected);
        });

        it('should execute one operation and advance the program counter', () => {
            defaultCpu.memory[defaultCpu.rPC] = 0xA9; // LDA immediate
            defaultCpu.memory[defaultCpu.rPC + 1] = 0x7F; // LDA #$7F
            defaultCpu.controls.runningState = true;
            const expected = cloneCpu(defaultCpu);
            freezeCpu(defaultCpu);
            expected.rPC += 2;
            expected.rA = 0x7F;
            expected.stats.instructionCount = 1;
            expect(cpuReducer(defaultCpu, {
                type: Actions.Step
            })).toEqual(expected);
        });

        it('should compute instructions and timelapse', () => {
            defaultCpu.memory[defaultCpu.rPC] = 0xA9; // LDA immediate
            defaultCpu.memory[defaultCpu.rPC + 1] = 0x7F; // LDA #$7F
            defaultCpu.controls.runningState = true;
            defaultCpu.stats.started = new Date();

            freezeCpu(defaultCpu);

            const result = cpuReducer(defaultCpu, {
                type: Actions.Step
            }) as Cpu;

            expect(result.stats.instructionCount).toBe(1);
            expect(result.stats.ellapsedMilliseconds).toBeGreaterThan(0);
            expect(result.stats.instructionsPerSecond).toBeGreaterThan(0);
            console.log(`Ran ${result.stats.instructionCount} op in ${result.stats.ellapsedMilliseconds}ms` +
                ` at ${result.stats.instructionsPerSecond} ips`);
        });

    });

    describe('run', () => {

        it('should do nothing if not in a running state', () => {
            expect(cpuReducer(defaultCpu, <IRunAction>{
                type: Actions.Run,
                iterations: 5
            })).toEqual(defaultCpu);
        });

        it('should catch exceptions and set the error state', () => {
            const expected: Cpu = initialCpuState();
            expected.rPC += 1;
            expected.controls.errorState = true;
            expected.controls.errorMessage = INVALID_OP + ' (0)';
            defaultCpu.controls.runningState = true;
            freezeCpu(defaultCpu);
            expect(cpuReducer(defaultCpu, <IRunAction>{
                type: Actions.Run,
                iterations: 5
            })).toEqual(expected);
        });

        it('should execute as many operations as the iterations are set', () => {
            for (let count = 0; count < 80; count += 1) {
                defaultCpu.memory[defaultCpu.rPC + count * 2] = 0xA9; // LDA immediate
                defaultCpu.memory[defaultCpu.rPC + count * 2 + 1] = count; // LDA#$<count>
            }
            defaultCpu.controls.runningState = true;
            defaultCpu.stats.started = new Date();

            freezeCpu(defaultCpu);

            const result = cpuReducer(defaultCpu, <IRunAction>{
                type: Actions.Run,
                iterations: 70
            });

            expect(result.rPC).toEqual(defaultCpu.rPC + 70 * 2);
            expect(result.rA).toEqual(69);
            expect(result.stats.instructionCount).toBe(70);

            console.log(`Ran ${result.stats.instructionCount} ops in ${result.stats.ellapsedMilliseconds}ms` +
                ` at ${result.stats.instructionsPerSecond} ips`);
        });

    });

    describe('start', () => {
        it('should do nothing if already started', () => {
            const expected = initialCpuState();
            defaultCpu.controls.runningState = expected.controls.runningState = true;
            freezeCpu(defaultCpu);
            expect(cpuReducer(defaultCpu, {
                type: Actions.Start
            })).toEqual(expected);
        });

        it('should do nothing if error state', () => {
            const expected = initialCpuState();
            defaultCpu.controls.errorState = expected.controls.errorState = true;
            freezeCpu(defaultCpu);
            expect(cpuReducer(defaultCpu, {
                type: Actions.Start
            })).toEqual(expected);
        });

        it('should set the start time and zero stats', () => {
            defaultCpu.stats.instructionCount = 1;
            freezeCpu(defaultCpu);
            const actual = cpuReducer(defaultCpu, {
                type: Actions.Start
            }) as Cpu;
            expect(actual.stats.started).not.toBeNull();
            expect(actual.stats.instructionCount).toBe(0);
        });
    });

    describe('poke', () => {
        it('should handle poke by updating the memory location to the value', () => {
            const expected: Cpu = initialCpuState();
            expected.memory[1] = 2;

            freezeCpu(defaultCpu);

            expect(cpuReducer(defaultCpu, <IPokeAction>{
                type: Actions.Poke,
                address: 1,
                value: [2]
            })).toEqual(expected);
        });

        it('should handle multiple bytes', () => {
            const expected: Cpu = initialCpuState();
            expected.memory[1] = 2;
            expected.memory[2] = 3;

            freezeCpu(defaultCpu);

            expect(cpuReducer(defaultCpu, <IPokeAction>{
                type: Actions.Poke,
                address: 1,
                value: [2, 3]
            })).toEqual(expected);
        });

        it('should not allow memory overflow', () => {
            const expected: Cpu = initialCpuState();
            expected.memory[1] = 2;

            freezeCpu(defaultCpu);

            expect(cpuReducer(defaultCpu, <IPokeAction>{
                type: Actions.Poke,
                address: Memory.Size + 1,
                value: [2]
            })).toEqual(expected);
        });

        it('should force values to 8-bits', () => {
            const expected: Cpu = initialCpuState();
            expected.memory[1] = 2;

            freezeCpu(defaultCpu);

            expect(cpuReducer(defaultCpu, <IPokeAction>{
                type: Actions.Poke,
                address: 1,
                value: [Memory.ByteMask + 3]
            })).toEqual(expected);
        });
    });

    describe('setPC', () => {
        it('should handle program counter by updating the PC to the value', () => {
            const expected: Cpu = initialCpuState();
            expected.rPC = 0xC000;

            freezeCpu(defaultCpu);

            expect(cpuReducer(defaultCpu, <ISetPCAction>{
                type: Actions.SetPC,
                address: 0xC000
            })).toEqual(expected);
        });

        it('should handle overflow addresses', () => {
            const expected: Cpu = initialCpuState();
            expected.rPC = 0x01;

            freezeCpu(defaultCpu);

            expect(cpuReducer(defaultCpu, <ISetPCAction>{
                type: Actions.SetPC,
                address: 0x10001
            })).toEqual(expected);
        });
    });
});
