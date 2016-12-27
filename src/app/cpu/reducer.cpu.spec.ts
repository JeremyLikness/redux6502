import { Actions } from './actions.cpu';

import { Memory, INVALID_OP } from './constants';

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

  it('should handle stop by setting runningState to false', () => {

      let expected: Cpu = cloneCpu(defaultCpu);
      defaultCpu.controls.runningState = true;

      freezeCpu(defaultCpu);

      expect(cpuReducer(defaultCpu, {
          type: Actions.Stop
        })).toEqual(expected);
  });

  it('should handle reset by initializing the CPU', () => {

      let expected: Cpu = initialCpuState();

      defaultCpu.controls.runningState = true;
      defaultCpu.memory[5] = 6;

      freezeCpu(defaultCpu);

      expect(cpuReducer(defaultCpu, {
          type: Actions.Reset
        })).toEqual(expected);
  });

    it('should handle halt by setting runningState to false and errorState to true', () => {

      let expected: Cpu = initialCpuState();
      expected.controls.runningState = false;
      expected.controls.errorState = true;

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
          let expected: Cpu = initialCpuState();
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
          let expected = cloneCpu(defaultCpu);
          freezeCpu(defaultCpu);
          expected.rPC += 2;
          expected.rA = 0x7F;
          expected.stats.instructionCount = 1;
          expect(cpuReducer(defaultCpu, {
              type: Actions.Step
          })).toEqual(expected);
      });

  });

  describe('run', () => {

      it('should do nothing if not in a running state', () => {
          expect(cpuReducer(defaultCpu, {
              type: Actions.Run,
              iterations: 5
          })).toEqual(defaultCpu);
      });

      it('should catch exceptions and set the error state', () => {
          let expected: Cpu = initialCpuState();
          expected.rPC += 1;
          expected.controls.errorState = true;
          expected.controls.errorMessage = INVALID_OP + ' (0)';
          defaultCpu.controls.runningState = true;
          freezeCpu(defaultCpu);
          expect(cpuReducer(defaultCpu, {
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
          let expected = cloneCpu(defaultCpu);
          freezeCpu(defaultCpu);
          expected.rPC += 70 * 2;
          expected.rA = 69;
          expected.stats.instructionCount = 70;
          expect(cpuReducer(defaultCpu, {
              type: Actions.Run,
              iterations: 70
          })).toEqual(expected);
      });

  });

  describe('start', () => {
      it('should do nothing if already started', () => {
          let expected = initialCpuState();
          defaultCpu.controls.runningState = expected.controls.runningState = true;
          freezeCpu(defaultCpu);
          expect(cpuReducer(defaultCpu, {
              type: Actions.Start
          })).toEqual(expected);
      });

      it('should do nothing if error state', () => {
            let expected = initialCpuState();
            defaultCpu.controls.errorState = expected.controls.errorState = true;
            freezeCpu(defaultCpu);
            expect(cpuReducer(defaultCpu, {
                type: Actions.Start
            })).toEqual(expected);
      });

      it('should set the start time and zero stats', () => {
          defaultCpu.stats.instructionCount = 1;
          freezeCpu(defaultCpu);
          let actual = cpuReducer(defaultCpu, {
              type: Actions.Start
          }) as Cpu;
          expect(actual.stats.started).not.toBeNull();
          expect(actual.stats.instructionCount).toBe(0);
      });
  });

  describe('poke', () => {
      it('should handle poke by updating the memory location to the value', () => {
          let expected: Cpu = initialCpuState();
          expected.memory[1] = 2;

          freezeCpu(defaultCpu);

          expect(cpuReducer(defaultCpu, {
              type: Actions.Poke,
              address: 1,
              value: [2]
          })).toEqual(expected);
      });

      it('should handle multiple bytes', () => {
          let expected: Cpu = initialCpuState();
          expected.memory[1] = 2;
          expected.memory[2] = 3;

          freezeCpu(defaultCpu);

          expect(cpuReducer(defaultCpu, {
              type: Actions.Poke,
              address: 1,
              value: [2, 3]
          })).toEqual(expected);
      });

      it('should not allow memory overflow', () => {
          let expected: Cpu = initialCpuState();
          expected.memory[1] = 2;

          freezeCpu(defaultCpu);

          expect(cpuReducer(defaultCpu, {
              type: Actions.Poke,
              address: Memory.Size + 1,
              value: [2]
          })).toEqual(expected);
      });

      it('should force values to 8-bits', () => {
          let expected: Cpu = initialCpuState();
          expected.memory[1] = 2;

          freezeCpu(defaultCpu);

          expect(cpuReducer(defaultCpu, {
              type: Actions.Poke,
              address: 1,
              value: [Memory.ByteMask + 3]
          })).toEqual(expected);
      });
  });

  describe('setPC', () => {
      it('should handle program counter by updating the PC to the value', () => {
          let expected: Cpu = initialCpuState();
          expected.rPC = 0xC000;

          freezeCpu(defaultCpu);

          expect(cpuReducer(defaultCpu, {
              type: Actions.SetPC,
              address: 0xC000
          })).toEqual(expected);
      });

      it('should handle overflow addresses', () => {
          let expected: Cpu = initialCpuState();
          expected.rPC = 0x01;

          freezeCpu(defaultCpu);

          expect(cpuReducer(defaultCpu, {
              type: Actions.SetPC,
              address: 0x10001
          })).toEqual(expected);
      });
  });
});
