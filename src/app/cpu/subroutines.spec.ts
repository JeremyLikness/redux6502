import { Cpu, initialCpuState } from './cpuState';
import { poke } from './globals';
import { cpuReducer } from './reducer.cpu';
import { cpuPoke, cpuSetPC, cpuStart, cpuRun } from './actions.cpu';

import { createStore, Store } from 'redux';

import { TestBed } from '@angular/core/testing';

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
            expect(store.getState().memory[0xC009]).toBe(0x7F);
        });
    });
});
