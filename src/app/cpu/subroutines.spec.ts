import { Cpu, initialCpuState } from './cpuState';
import { poke } from './globals';

import { TestBed } from '@angular/core/testing';

describe('sample programs', () => {

    let cpu: Cpu = null;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ initialCpuState ]
        });

        cpu = initialCpuState();

    });

/* 
    C000: LDX #$08 
    C002: LDA $C000,X 
    C005: JMP $C009 
    C008: 0x7F 
    C009: NOP 
    C006: STA $C009
*/
    describe('JMP and STORE', () => {
        it('Jumps to the address then stores the value', () => {
            poke(cpu, 0xC000, [0xA2, 0x08, 0xBD, 0x00, 0xC0, 0x4C, 0x09, 0xC0, 0x7F, 0xEA, 0x8D, 0x09, 0xC0]);
            cpu.rPC = 0xC000;
            cpu.execute(); // LDX #$08 
            cpu.execute(); // LDA $C000,X 
            cpu.execute(); // JMP $C009 
            cpu.execute(); // NOP 
            cpu.execute(); // STA $C009 
            expect(cpu.memory[0xC009]).toBe(0x7F);
        });
    });
});
