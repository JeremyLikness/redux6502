/*
RTS (ReTurn from Subroutine)

Affects Flags: none

MODE           SYNTAX       HEX LEN TIM
Implied       RTS           $60  1   6

RTS pulls the top two bytes off the stack (low byte first) and transfers program control to that address+1. 
It is used, as expected, to exit a subroutine invoked via JSR which pushed the address-1.
RTS is frequently used to implement a jump table where addresses-1 are pushed onto the stack and accessed via RTS eg. 
to access the second of four routines:

 LDX #1
 JSR EXEC
 JMP SOMEWHERE

LOBYTE
 .BYTE <ROUTINE0-1,<ROUTINE1-1
 .BYTE <ROUTINE2-1,<ROUTINE3-1

HIBYTE
 .BYTE >ROUTINE0-1,>ROUTINE1-1
 .BYTE >ROUTINE2-1,>ROUTINE3-1

EXEC
 LDA HIBYTE,X
 PHA
 LDA LOBYTE,X
 PHA
 RTS
*/
