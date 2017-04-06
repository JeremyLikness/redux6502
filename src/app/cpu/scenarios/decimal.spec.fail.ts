// this test currently fails, indicating an issue with the implementation of decimal
// mode in the emulator. To run it, rename it and remove the "fail" suffix. Goal is
// to successfully run this suite of tests and have it pass. The issues are most
// likely in the implementation of add with carry and substract with carry. As the
// math tests are fairly straightforward, it is likely an issue with the flag handling.

const program = [
        0xA0, 0x01, 0x8C, 0xAF, 0x03, 0xA9, 0x00, 0x8D
        , 0xB0, 0x03, 0x8D, 0xB3, 0x03, 0xAD, 0xB3, 0x03
        , 0x29, 0x0F, 0x8D, 0xB4, 0x03, 0xAD, 0xB3, 0x03
        , 0x29, 0xF0, 0x8D, 0xB5, 0x03, 0x09, 0x0F, 0x8D
        , 0xB6, 0x03, 0xAD, 0xB0, 0x03, 0x29, 0x0F, 0x8D
        , 0xB1, 0x03, 0xAD, 0xB0, 0x03, 0x29, 0xF0, 0x8D
        , 0xB2, 0x03, 0x20, 0x5E, 0x02, 0x20, 0x47, 0x03
        , 0x20, 0x18, 0x03, 0xD0, 0x1D, 0x20, 0xB1, 0x02
        , 0x20, 0x54, 0x03, 0x20, 0x18, 0x03, 0xD0, 0x12
        , 0xEE, 0xB0, 0x03, 0xD0, 0xD5, 0xEE, 0xB3, 0x03
        , 0xD0, 0xBB, 0x88, 0x10, 0xB8, 0xA9, 0x00, 0x8D
        , 0xAF, 0x03, 0xAD, 0xAF, 0x03, 0x60, 0xF8, 0xC0
        , 0x01, 0xAD, 0xB0, 0x03, 0x6D, 0xB3, 0x03, 0x8D
        , 0xB7, 0x03, 0x08, 0x68, 0x8D, 0xB8, 0x03, 0xD8
        , 0xC0, 0x01, 0xAD, 0xB0, 0x03, 0x6D, 0xB3, 0x03
        , 0x8D, 0xB9, 0x03, 0x08, 0x68, 0x8D, 0xBA, 0x03
        , 0xC0, 0x01, 0xAD, 0xB1, 0x03, 0x6D, 0xB4, 0x03
        , 0xC9, 0x0A, 0xA2, 0x00, 0x90, 0x06, 0xE8, 0x69
        , 0x05, 0x29, 0x0F, 0x38, 0x0D, 0xB2, 0x03, 0x7D
        , 0xB5, 0x03, 0x08, 0xB0, 0x04, 0xC9, 0xA0, 0x90
        , 0x03, 0x69, 0x5F, 0x38, 0x8D, 0xBB, 0x03, 0x08
        , 0x68, 0x8D, 0xBC, 0x03, 0x68, 0x8D, 0xBD, 0x03
        , 0x60, 0xF8, 0xC0, 0x01, 0xAD, 0xB0, 0x03, 0xED
        , 0xB3, 0x03, 0x8D, 0xB7, 0x03, 0x08, 0x68, 0x8D
        , 0xB8, 0x03, 0xD8, 0xC0, 0x01, 0xAD, 0xB0, 0x03
        , 0xED, 0xB3, 0x03, 0x8D, 0xB9, 0x03, 0x08, 0x68
        , 0x8D, 0xBA, 0x03, 0x60, 0xC0, 0x01, 0xAD, 0xB1
        , 0x03, 0xED, 0xB4, 0x03, 0xA2, 0x00, 0xB0, 0x06
        , 0xE8, 0xE9, 0x05, 0x29, 0x0F, 0x18, 0x0D, 0xB2
        , 0x03, 0xFD, 0xB5, 0x03, 0xB0, 0x02, 0xE9, 0x5F
        , 0x8D, 0xBB, 0x03, 0x60, 0xC0, 0x01, 0xAD, 0xB1
        , 0x03, 0xED, 0xB4, 0x03, 0xA2, 0x00, 0xB0, 0x04
        , 0xE8, 0x29, 0x0F, 0x18, 0x0D, 0xB2, 0x03, 0xFD
        , 0xB5, 0x03, 0xB0, 0x02, 0xE9, 0x5F, 0xE0, 0x00
        , 0xF0, 0x02, 0xE9, 0x06, 0x8D, 0xBB, 0x03, 0x60
        , 0xAD, 0xB7, 0x03, 0xCD, 0xBB, 0x03, 0xD0, 0x26
        , 0xAD, 0xB8, 0x03, 0x4D, 0xBE, 0x03, 0x29, 0x80
        , 0xD0, 0x1C, 0xAD, 0xB8, 0x03, 0x4D, 0xBD, 0x03
        , 0x29, 0x40, 0xD0, 0x12, 0xAD, 0xB8, 0x03, 0x4D
        , 0xBF, 0x03, 0x29, 0x02, 0xD0, 0x08, 0xAD, 0xB8
        , 0x03, 0x4D, 0xBC, 0x03, 0x29, 0x01, 0x60, 0xAD
        , 0xBD, 0x03, 0x8D, 0xBE, 0x03, 0xAD, 0xBA, 0x03
        , 0x8D, 0xBF, 0x03, 0x60, 0x20, 0xD4, 0x02, 0xAD
        , 0xBA, 0x03, 0x8D, 0xBE, 0x03, 0x8D, 0xBD, 0x03
        , 0x8D, 0xBF, 0x03, 0x8D, 0xBC, 0x03, 0x60, 0xAD
        , 0xBB, 0x03, 0x08, 0x68, 0x8D, 0xBE, 0x03, 0x8D
        , 0xBF, 0x03, 0x60, 0x20, 0xF4, 0x02, 0xAD, 0xBB
        , 0x03, 0x08, 0x68, 0x8D, 0xBE, 0x03, 0x8D, 0xBF
        , 0x03, 0xAD, 0xBA, 0x03, 0x8D, 0xBD, 0x03, 0x8D
        , 0xBC, 0x03, 0x60, 0xAD, 0xBB, 0x03, 0x08, 0x68
        , 0x8D, 0xBE, 0x03, 0x8D, 0xBF, 0x03, 0x60, 0x20
        , 0xD4, 0x02, 0xAD, 0xBB, 0x03, 0x08, 0x68, 0x8D
        , 0xBE, 0x03, 0x8D, 0xBF, 0x03, 0xAD, 0xBA, 0x03
        , 0x8D, 0xBD, 0x03, 0x8D, 0xBC, 0x03, 0x60, 0xEA
        , 0xEA, 0xEA, 0xEA, 0xEA, 0xEA, 0xEA, 0xEA, 0xEA
        , 0xEA, 0xEA, 0xEA, 0xEA, 0xEA, 0xEA, 0xEA, 0xEA];

/*
; Verify decimal mode behavior
;
; Returns:
;   ERROR = 0 if the test passed
;   ERROR = 1 if the test failed
;
; This routine requires 17 bytes of RAM -- 1 byte each for:
;   AR, CF, DA, DNVZC, ERROR, HA, HNVZC, N1, N1H, N1L, N2, N2L, NF, VF, and ZF
; and 2 bytes for N2H
;
; Variables:
;   N1 and N2 are the two numbers to be added or subtracted
;   N1H, N1L, N2H, and N2L are the upper 4 bits and lower 4 bits of N1 and N2
;   DA and DNVZC are the actual accumulator and flag results in decimal mode
;   HA and HNVZC are the accumulator and flag results when N1 and N2 are
;     added or subtracted using binary arithmetic
;   AR, NF, VF, ZF, and CF are the predicted decimal mode accumulator and
;     flag results, calculated using binary arithmetic
;
; This program takes approximately 1 minute at 1 MHz (a few seconds more on
; a 65C02 than a 6502 or 65816)
;
TEST:    LDY #1    ; initialize Y (used to loop through carry flag values)
        STY ERROR ; store 1 in ERROR until the test passes
        LDA #0    ; initialize N1 and N2
        STA N1
        STA N2
LOOP1:   LDA N2    ; N2L = N2 & $0F
        AND #$0F  ; [1] see text
        STA N2L
        LDA N2    ; N2H = N2 & $F0
        AND #$F0  ; [2] see text
        STA N2H
        ORA #$0F  ; N2H+1 = (N2 & $F0) + $0F
        STA N2HPLUS1
LOOP2:   LDA N1    ; N1L = N1 & $0F
        AND #$0F  ; [3] see text
        STA N1L
        LDA N1    ; N1H = N1 & $F0
        AND #$F0  ; [4] see text
        STA N1H
        JSR ADD
        JSR A6502
        JSR COMPARE
        BNE DONE
        JSR SUB
        JSR S6502
        JSR COMPARE
        BNE DONE
        INC N1    ; [5] see text
        BNE LOOP2 ; loop through all 256 values of N1
        INC N2    ; [6] see text
        BNE LOOP1 ; loop through all 256 values of N2
        DEY
        BPL LOOP1 ; loop through both values of the carry flag
        LDA #0    ; test passed, so store 0 in ERROR
        STA ERROR
DONE:   LDA ERROR
        RTS

; Calculate the actual decimal mode accumulator and flags, the accumulator
; and flag results when N1 is added to N2 using binary arithmetic, the
; predicted accumulator result, the predicted carry flag, and the predicted
; V flag
;
ADD:     SED       ; decimal mode
        CPY #1    ; set carry if Y = 1, clear carry if Y = 0
        LDA N1
        ADC N2
        STA DA    ; actual accumulator result in decimal mode
        PHP
        PLA
        STA DNVZC ; actual flags result in decimal mode
        CLD       ; binary mode
        CPY #1    ; set carry if Y = 1, clear carry if Y = 0
        LDA N1
        ADC N2
        STA HA    ; accumulator result of N1+N2 using binary arithmetic

        PHP
        PLA
        STA HNVZC ; flags result of N1+N2 using binary arithmetic
        CPY #1
        LDA N1L
        ADC N2L
        CMP #$0A
        LDX #0
        BCC A1
        INX
        ADC #5    ; add 6 (carry is set)
        AND #$0F
        SEC
A1:      ORA N1H
;
; if N1L + N2L <  $0A, then add N2 & $F0
; if N1L + N2L >= $0A, then add (N2 & $F0) + $0F + 1 (carry is set)
;
        ADC N2H,X
        PHP
        BCS A2
        CMP #$A0
        BCC A3
A2:      ADC #$5F  ; add $60 (carry is set)
        SEC
A3:      STA AR    ; predicted accumulator result
        PHP
        PLA
        STA CF    ; predicted carry result
        PLA
;
; note that all 8 bits of the P register are stored in VF
;
        STA VF    ; predicted V flags
        RTS

; Calculate the actual decimal mode accumulator and flags, and the
; accumulator and flag results when N2 is subtracted from N1 using binary
; arithmetic
;
SUB:     SED       ; decimal mode
        CPY #1    ; set carry if Y = 1, clear carry if Y = 0
        LDA N1
        SBC N2
        STA DA    ; actual accumulator result in decimal mode
        PHP
        PLA
        STA DNVZC ; actual flags result in decimal mode
        CLD       ; binary mode
        CPY #1    ; set carry if Y = 1, clear carry if Y = 0
        LDA N1
        SBC N2
        STA HA    ; accumulator result of N1-N2 using binary arithmetic

        PHP
        PLA
        STA HNVZC ; flags result of N1-N2 using binary arithmetic
        RTS

; Calculate the predicted SBC accumulator result for the 6502 and 65816

;
SUB1:    CPY #1    ; set carry if Y = 1, clear carry if Y = 0
        LDA N1L
        SBC N2L
        LDX #0
        BCS S11
        INX
        SBC #5    ; subtract 6 (carry is clear)
        AND #$0F
        CLC
S11:     ORA N1H
;
; if N1L - N2L >= 0, then subtract N2 & $F0
; if N1L - N2L <  0, then subtract (N2 & $F0) + $0F + 1 (carry is clear)
;
        SBC N2H,X
        BCS S12
        SBC #$5F  ; subtract $60 (carry is clear)
S12:     STA AR
        RTS

; Calculate the predicted SBC accumulator result for the 6502 and 65C02

;
SUB2:    CPY #1    ; set carry if Y = 1, clear carry if Y = 0
        LDA N1L
        SBC N2L
        LDX #0
        BCS S21
        INX
        AND #$0F
        CLC
S21:     ORA N1H
;
; if N1L - N2L >= 0, then subtract N2 & $F0
; if N1L - N2L <  0, then subtract (N2 & $F0) + $0F + 1 (carry is clear)
;
        SBC N2H,X
        BCS S22
        SBC #$5F   ; subtract $60 (carry is clear)
S22:     CPX #0
        BEQ S23
        SBC #6
S23:     STA AR     ; predicted accumulator result
        RTS

; Compare accumulator actual results to predicted results
;
; Return:
;   Z flag = 1 (BEQ branch) if same
;   Z flag = 0 (BNE branch) if different
;
COMPARE: LDA DA
        CMP AR
        BNE C1
        LDA DNVZC ; [7] see text
        EOR NF
        AND #$80  ; mask off N flag
        BNE C1
        LDA DNVZC ; [8] see text
        EOR VF
        AND #$40  ; mask off V flag
        BNE C1    ; [9] see text
        LDA DNVZC
        EOR ZF    ; mask off Z flag
        AND #2
        BNE C1    ; [10] see text
        LDA DNVZC
        EOR CF
        AND #1    ; mask off C flag
C1:      RTS

; These routines store the predicted values for ADC and SBC for the 6502,
; 65C02, and 65816 in AR, CF, NF, VF, and ZF

A6502:   LDA VF
;
; since all 8 bits of the P register were stored in VF, bit 7 of VF contains
; the N flag for NF
;
        STA NF
        LDA HNVZC
        STA ZF
        RTS

S6502:   JSR SUB1
        LDA HNVZC
        STA NF
        STA VF
        STA ZF
        STA CF
        RTS

A65C02:  LDA AR
        PHP
        PLA
        STA NF
        STA ZF
        RTS

S65C02:  JSR SUB2
        LDA AR
        PHP
        PLA
        STA NF
        STA ZF
        LDA HNVZC
        STA VF
        STA CF
        RTS

A65816:  LDA AR
        PHP
        PLA
        STA NF
        STA ZF
        RTS

S65816:  JSR SUB1
        LDA AR
        PHP
        PLA
        STA NF
        STA ZF
        LDA HNVZC
        STA VF
        STA CF
        RTS
ERROR: NOP
N1: NOP
N1L: NOP
N1H: NOP
N2: NOP
N2L: NOP
N2H: NOP
N2HPLUS1: NOP
DA: NOP
DNVZC: NOP
HA: NOP
HNVZC: NOP
AR: NOP
CF: NOP
VF: NOP
NF: NOP
ZF: NOP
*/

const memory = 0x200;

import { Cpu, initialCpuState } from '../cpuState';
import { STACK_EMPTY } from '../constants';
import { poke } from '../globals';
import { cpuReducer } from '../reducer.cpu';
import { cpuPoke, cpuSetPC, cpuStart, cpuRun } from '../actions.cpu';
import { perf } from './common';

import { createStore, Store } from 'redux';

import { TestBed } from '@angular/core/testing';

describe('decimal test', () => {

        let store: Store<Cpu> = null;

        beforeEach(() => {
                TestBed.configureTestingModule({
                        declarations: [initialCpuState]
                });

                store = createStore(cpuReducer);
        });

        it('completes all decimal tests and exits with ZERO in the accumulator', () => {
                store.dispatch(cpuPoke(memory, program));
                store.dispatch(cpuSetPC(0x0200));
                store.dispatch(cpuStart());
                store.dispatch(cpuRun(9999999));
                const cpu = store.getState();
                expect(cpu.controls.errorMessage).toBe(STACK_EMPTY); // hit RTS
                expect(cpu.rA).toBe(0x0); // success condition
                perf(cpu);
        });
});
