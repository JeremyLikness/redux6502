import { Cpu, initialCpuState } from './cpuState';
import { poke } from './globals';
import { cpuReducer } from './reducer.cpu';
import { cpuPoke, cpuSetPC, cpuStart, cpuRun } from './actions.cpu';

import { createStore, Store } from 'redux';

import { TestBed } from '@angular/core/testing';

const perf = (cpu: Cpu) => {
    console.log(`Ran ${cpu.stats.instructionCount} ops in ${cpu.stats.ellapsedMilliseconds}ms` +
            ` at ${cpu.stats.instructionsPerSecond} ips`);
};

describe('sample programs', () => {

    let store: Store<Cpu> = null;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ initialCpuState ]
        });

        store = createStore(cpuReducer);
    });

    describe('JMP and STORE', () => {
/* 
    C000: LDX #$08 
    C002: LDA $C000,X 
    C005: JMP $C009 
    C008: 0x7F 
    C009: NOP 
    C006: STA $C009
*/
        it('Jumps to the address then stores the value', () => {
            store.dispatch(cpuPoke(0xC000, [0xA2, 0x08, 0xBD, 0x00, 0xC0, 0x4C, 0x09, 0xC0, 0x7F, 0xEA, 0x8D, 0x09, 0xC0]));
            store.dispatch(cpuSetPC(0xC000));
            store.dispatch(cpuStart());
            store.dispatch(cpuRun(6));
            let cpu = store.getState();
            expect(cpu.memory[0xC009]).toBe(0x7F);
            perf(cpu);
        });
    });

    describe('LDA and BEQ', () => {
/*
    C000: LDX #$00 
    C002: LDA $C00C,X
    C005: BEQ $C00B 
    C007: INX 
    C008: JMP $C002
    C00B: 0X00 
    C00C: 01 02 03 04 05 00 
*/
        it('loops until a zero value is encountered', () => {
            store.dispatch(
                cpuPoke(
                    0xC000,
                    [0xA2, 0x00, 0xBD, 0x0C, 0xC0, 0xF0, 0x05, 0xE8, 0x4C, 0x02, 0xC0, 0x00, 0x01, 0x02, 0x03, 0x04, 0x05]
                )
            );
            store.dispatch(cpuSetPC(0xC000));
            store.dispatch(cpuStart());
            store.dispatch(cpuRun(255));
            let cpu = store.getState();
            expect(cpu.rPC).toBe(0xC00C);
            expect(cpu.rX).toBe(0x05);
            perf(cpu);
        });
    });

    describe('JSR and RTS', () => {
/*
    C000: LDX #$00 
    C002: JSR $C007
    C005: TXA 
    C006: 0x00 
    C007: LDX #$7F
    C009: RTS 
*/
        it('successfully returns from the subroutine', () => {
            store.dispatch(
                cpuPoke(
                    0xC000,
                    [0xA2, 0x00, 0x20, 0x07, 0xC0, 0x8A, 0x00, 0xA2, 0x7F, 0x60]
                )
            );
            store.dispatch(cpuSetPC(0xC000));
            store.dispatch(cpuStart());
            store.dispatch(cpuRun(255));
            let cpu = store.getState();
            expect(cpu.rPC).toBe(0xC007);
            expect(cpu.rA).toBe(0x7F);
            perf(cpu);
        });
    });
});
