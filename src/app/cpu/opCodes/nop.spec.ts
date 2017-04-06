import { Cpu, initialCpuState, cloneCpu } from '../cpuState';

import { TestBed } from '@angular/core/testing';

import { NopFamily } from './nop';

describe('nop', () => {

    let nop: NopFamily = null;
    let cpu: Cpu = null;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [NopFamily]
        });

        nop = new NopFamily();
        cpu = initialCpuState();

    });

    it('should do nothing', () => {
        cpu.memory[cpu.rPC] = 0xEA;
        const expected = cloneCpu(cpu);
        nop.execute(cpu, 0xEA);
        expect(cpu).toEqual(expected);
    });
});
