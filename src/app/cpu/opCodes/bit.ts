/*
BIT (test BITs)

Affects Flags: N V Z

MODE           SYNTAX       HEX LEN TIM
Zero Page     BIT $44       $24  2   3
Absolute      BIT $4400     $2C  3   4

BIT sets the Z flag as though the value in the address tested were ANDed with the accumulator. 
The S and V flags are set to match bits 7 and 6 respectively in the value stored at the tested address.
BIT is often used to skip one or two following bytes as in:

CLOSE1 LDX #$10   If entered here, we
       .BYTE $2C  effectively perform
CLOSE2 LDX #$20   a BIT test on $20A2,
       .BYTE $2C  another one on $30A2,
CLOSE3 LDX #$30   and end up with the X
CLOSEX LDA #12    register still at $10
       STA ICCOM,X upon arrival here.
*/
