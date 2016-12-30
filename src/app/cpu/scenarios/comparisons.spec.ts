const program = [
  0xD8, 0xA9, 0x01, 0x8D, 0x89, 0x02, 0xBA, 0xA9
, 0x00, 0x8D, 0x8A, 0x02, 0xA9, 0x00, 0x8D, 0x8B
, 0x02, 0x20, 0x7C, 0x02, 0xEE, 0x8B, 0x02, 0x10
, 0xF8, 0xEE, 0x8A, 0x02, 0x10, 0xEE, 0xA9, 0x00
, 0x8D, 0x8A, 0x02, 0xA9, 0x80, 0x8D, 0x8B, 0x02
, 0x20, 0x70, 0x02, 0x30, 0x3F, 0xEE, 0x8B, 0x02
, 0x30, 0xF6, 0xEE, 0x8A, 0x02, 0x10, 0xEC, 0xA9
, 0x80, 0x8D, 0x8A, 0x02, 0xA9, 0x00, 0x8D, 0x8B
, 0x02, 0x20, 0x70, 0x02, 0x10, 0x26, 0xEE, 0x8B
, 0x02, 0x10, 0xF6, 0xEE, 0x8A, 0x02, 0x30, 0xEC
, 0xA9, 0x80, 0x8D, 0x8A, 0x02, 0xA9, 0x80, 0x8D
, 0x8B, 0x02, 0x20, 0x7C, 0x02, 0xEE, 0x8B, 0x02
, 0x30, 0xF8, 0xEE, 0x8A, 0x02, 0x30, 0xEE, 0xA9
, 0x00, 0x8D, 0x89, 0x02, 0xAD, 0x89, 0x02, 0x60
, 0x38, 0xAD, 0x8A, 0x02, 0xED, 0x8B, 0x02, 0x50
, 0x02, 0x49, 0x80, 0x60, 0x20, 0x70, 0x02, 0x90
, 0x04, 0x10, 0x01, 0xBA, 0x60, 0x30, 0x01, 0xBA
, 0x60, 0xEA, 0xEA, 0xEA, 0x00, 0x00, 0x00, 0x00];

/*
; Test the signed compare routine
;
; Returns with ERROR = 0 if the test passes, ERROR = 1 if the test fails
;
; Three (additional) memory locations are used: ERROR, N1, and N2
; These may be located anywhere convenient in RAM
;
TEST:    CLD        ; Clear decimal mode for test
        LDA #1
        STA ERROR  ; Store 1 in ERROR until test passes
        TSX        ; Save stack pointer so subroutines can exit with ERROR = 1
;
; Test N1 positive, N2 positive
;
        LDA #$00   ; 0
        STA N1
PP1:     LDA #$00   ; 0
        STA N2
PP2:     JSR SUCMP  ; Verify that the signed and unsigned comparison agree
        INC N2
        BPL PP2
        INC N1
        BPL PP1
;
; Test N1 positive, N2 negative
;
        LDA #$00   ; 0
        STA N1
PN1:     LDA #$80   ; -128
        STA N2
PN2:     JSR SCMP   ; Signed comparison
        BMI TEST1  ; if N1 (positive) < N2 (negative) exit with ERROR = 1
        INC N2
        BMI PN2
        INC N1
        BPL PN1
;
; Test N1 negative, N2 positive
;
        LDA #$80   ; -128
        STA N1
NP1:     LDA #$00   ; 0
        STA N2
NP2:     JSR SCMP   ; Signed comparison
        BPL TEST1  ; if N1 (negative) >= N2 (positive) exit with ERROR = 1
        INC N2
        BPL NP2
        INC N1
        BMI NP1
;
; Test N1 negative, N2 negative
;
        LDA #$80   ; -128
        STA N1
NN1:     LDA #$80   ; -128
        STA N2
NN2:     JSR SUCMP  ; Verify that the signed and unsigned comparisons agree
        INC N2
        BMI NN2
        INC N1
        BMI NN1

        LDA #0
        STA ERROR  ; All tests pass, so store 0 in ERROR
TEST1:  LDA ERROR 
        RTS

; Signed comparison
;
; Returns with:
;   N=0 (BPL branches) if N1 >= N2 (signed)
;   N=1 (BMI branches) if N1 < N2 (signed)
;
; The unsigned comparison result is returned in the C flag (for free)
;
SCMP:    SEC
        LDA N1     ; Compare N1 and N2
        SBC N2
        BVC SCMP1  ; Branch if V = 0
        EOR #$80   ; Invert Accumulator bit 7 (which also inverts the N flag)
SCMP1:   RTS

; Test the signed and unsigned comparisons to confirm that they agree
;
SUCMP:   JSR SCMP   ; Signed (and unsigned) comparison
        BCC SUCMP2 ; Branch if N1 < N2 (unsigned)
        BPL SUCMP1 ; N1 >= N2 (unsigned), branch if N1 >= N2 (signed)
        TSX        ; reset stack and exit with ERROR = 1
SUCMP1:  RTS
SUCMP2:  BMI SUCMP3 ; N1 < N2 (unsigned), branch if N1 < N2 (signed)
        TSX        ; reset stack and exit with ERROR = 1
SUCMP3:  RTS
ERROR: NOP 
N1: NOP
N2: NOP
*/

const memory = 0x200;

import { Cpu, initialCpuState } from '../cpuState';
import { poke } from '../globals';
import { STACK_EMPTY } from '../constants';
import { cpuReducer } from '../reducer.cpu';
import { cpuPoke, cpuSetPC, cpuStart, cpuRun } from '../actions.cpu';
import { perf } from './common';

import { createStore, Store } from 'redux';

import { TestBed } from '@angular/core/testing';

describe('comparison test', () => {

    let store: Store<Cpu> = null;

    beforeEach(() => {
        TestBed.configureTestingModule({
           declarations: [ initialCpuState ]
        });

        store = createStore(cpuReducer);
    });

    it('completes all comparisons and exits with ZERO in the accumulator', () => {
            store.dispatch(cpuPoke(memory, program));
            store.dispatch(cpuSetPC(0x0200));
            store.dispatch(cpuStart());
            store.dispatch(cpuRun(710000));
            let cpu = store.getState();
            expect(cpu.controls.errorMessage).toBe(STACK_EMPTY); // hit RTS
            expect(cpu.rA).toBe(0x0); // success condition
            perf(cpu);
    });
});
