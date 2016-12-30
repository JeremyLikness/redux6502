const program = [
    0xA0, 0x00, 0x84, 0x32, 0xB1, 0x30, 0xAA, 0xC8
, 0xCA, 0xB1, 0x30, 0xC8, 0xD1, 0x30, 0x90, 0x10
, 0xF0, 0x0E, 0x48, 0xB1, 0x30, 0x88, 0x91, 0x30
, 0x68, 0xC8, 0x91, 0x30, 0xA9, 0xFF, 0x85, 0x32
, 0xCA, 0xD0, 0xE6, 0x24, 0x32, 0x30, 0xD9, 0x60];

/*
Source: http://6502.org/source/sorting/bubble8.htm 

;THIS SUBROUTINE ARRANGES THE 8-BIT ELEMENTS OF A LIST IN ASCENDING
;ORDER.  THE STARTING ADDRESS OF THE LIST IS IN LOCATIONS $30 AND
;$31.  THE LENGTH OF THE LIST IS IN THE FIRST BYTE OF THE LIST.  LOCATION
;$32 IS USED TO HOLD AN EXCHANGE FLAG.

SORT8:   LDY #$00      ;TURN EXCHANGE FLAG OFF (= 0)
         STY $32
         LDA ($30),Y   ;FETCH ELEMENT COUNT
         TAX           ; AND PUT IT INTO X
         INY           ;POINT TO FIRST ELEMENT IN LIST
         DEX           ;DECREMENT ELEMENT COUNT
NXTEL:    LDA ($30),Y   ;FETCH ELEMENT
         INY
         CMP ($30),Y   ;IS IT LARGER THAN THE NEXT ELEMENT?
         BCC CHKEND
         BEQ CHKEND
                       ;YES. EXCHANGE ELEMENTS IN MEMORY
         PHA           ; BY SAVING LOW BYTE ON STACK.
         LDA ($30),Y   ; THEN GET HIGH BYTE AND
         DEY           ; STORE IT AT LOW ADDRESS
         STA ($30),Y
         PLA           ;PULL LOW BYTE FROM STACK
         INY           ; AND STORE IT AT HIGH ADDRESS
         STA ($30),Y
         LDA #$FF      ;TURN EXCHANGE FLAG ON (= -1)
         STA $32
CHKEND:   DEX           ;END OF LIST?
         BNE NXTEL     ;NO. FETCH NEXT ELEMENT
         BIT $32       ;YES. EXCHANGE FLAG STILL OFF?
         BMI SORT8     ;NO. GO THROUGH LIST AGAIN
         RTS           ;YES. LIST IS NOW ORDERED
*/

const memory = 0x200;

import { Cpu, initialCpuState } from '../cpuState';
import { poke, Byte } from '../globals';
import { STACK_EMPTY } from '../constants';
import { cpuReducer } from '../reducer.cpu';
import { cpuPoke, cpuSetPC, cpuStart, cpuRun } from '../actions.cpu';
import { perf } from './common';

import { createStore, Store } from 'redux';

import { TestBed } from '@angular/core/testing';

describe('sorting test', () => {

    let store: Store<Cpu> = null;

    beforeEach(() => {
        TestBed.configureTestingModule({
           declarations: [ initialCpuState ]
        });

        store = createStore(cpuReducer);
    });

    it('sorts the full list in ascending order', () => {

            let list: Byte[] = [];
            let length = 50;

            // generate a random list 
            for (let idx = 0; idx < length; idx += 1) {
                list.push(Math.floor(Math.random() * 256));
            }

            // load the program 
            store.dispatch(cpuPoke(memory, program));

            // load the list (first element is the size)
            store.dispatch(cpuPoke(0x300, [length, ...list]));

            // store the location of the list
            store.dispatch(cpuPoke(0x30, [0x00, 0x03]));

            store.dispatch(cpuSetPC(0x0200));
            store.dispatch(cpuStart());
            store.dispatch(cpuRun(99999));
            let cpu = store.getState();
            expect(cpu.controls.errorMessage).toBe(STACK_EMPTY); // hit RTS
            for (let idx = 0; idx < length - 1; idx += 1) {
                expect(cpu.memory[0x300 + 1 + idx])
                    .toBeLessThanOrEqual(cpu.memory[0x300 + 2 + idx]);
            }
            perf(cpu);
    });
});
