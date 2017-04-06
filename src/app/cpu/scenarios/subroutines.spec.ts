import { Cpu, initialCpuState } from '../cpuState';
import { poke } from '../globals';
import { cpuReducer } from '../reducer.cpu';
import { cpuPoke, cpuSetPC, cpuStart, cpuRun } from '../actions.cpu';

import { createStore, Store } from 'redux';

import { TestBed } from '@angular/core/testing';

import { perf } from './common';

describe('sample programs', () => {

    let store: Store<Cpu> = null;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [initialCpuState]
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
            const cpu = store.getState();
            expect(cpu.memory[0xC009]).toBe(0x7F);
            perf(cpu);
        });
    });

    describe('LDA and BEQ', () => {
        /*
            C000: LDX #$00
            C002: LDA $C00B,X
            C005: BEQ $C00A
            C007: INX
            C008: BNE $C002
            C00A: 0x00
            C00B: 01 02 03 04 05 00
        */
        it('loops until a zero value is encountered', () => {
            store.dispatch(
                cpuPoke(
                    0xC000,
                    [0xA2, 0x00, 0xBD, 0x0B, 0xC0, 0xF0, 0x03, 0xE8, 0xD0, 0xF8, 0x00, 0x01,
                        0x02, 0x03, 0x04, 0x05]
                )
            );
            store.dispatch(cpuSetPC(0xC000));
            store.dispatch(cpuStart());
            store.dispatch(cpuRun(255));
            const cpu = store.getState();
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
            const cpu = store.getState();
            expect(cpu.rPC).toBe(0xC007);
            expect(cpu.rA).toBe(0x7F);
            perf(cpu);
        });
    });

    describe('multiply by 10', () => {
        /*
            C000: LDA #$10 // 16
            C002: ASL
            C003: STA $00
            C005: ASL
            C006: ASL
            C007: CLC
            C008: ADC $00
            C009: RTS
        */
        it('successfully multiplies by 10', () => {
            store.dispatch(
                cpuPoke(
                    0xC000,
                    [0xA9, 0x10, 0x0A, 0x85, 0x00, 0x0A, 0x0A, 0x18, 0x65, 0x00, 0x60]
                )
            );
            store.dispatch(cpuSetPC(0xC000));
            store.dispatch(cpuStart());
            store.dispatch(cpuRun(255));
            const cpu = store.getState();
            expect(cpu.rPC).toBe(0xC00B);
            expect(cpu.rA).toBe(0x10 * 10);
            perf(cpu);
        });
    });
});
