import { Actions } from './actions.cpu';

import { Memory } from './constants';

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

  describe('poke', () => {
      it('should handle poke by updating the memory location to the value', () => {

          let expected: Cpu = initialCpuState();
          expected.memory[1] = 2;

          freezeCpu(defaultCpu);

          expect(cpuReducer(defaultCpu, {
              type: Actions.Poke,
              address: 1,
              value: 2
          })).toEqual(expected);
      });

      it('should not allow memory overflow', () => {
          let expected: Cpu = initialCpuState();
          expected.memory[1] = 2;

          freezeCpu(defaultCpu);

          expect(cpuReducer(defaultCpu, {
              type: Actions.Poke,
              address: Memory.Size + 1,
              value: 2
          })).toEqual(expected);
      });

      it('should force values to 8-bits', () => {
          let expected: Cpu = initialCpuState();
          expected.memory[1] = 2;

          freezeCpu(defaultCpu);

          expect(cpuReducer(defaultCpu, {
              type: Actions.Poke,
              address: 1,
              value: Memory.ByteMask + 3
          })).toEqual(expected);
      });
  });
});
