/*
CMP (CoMPare accumulator)

Affects Flags: S Z C

MODE           SYNTAX       HEX LEN TIM
Immediate     CMP #$44      $C9  2   2
Zero Page     CMP $44       $C5  2   3
Zero Page,X   CMP $44,X     $D5  2   4
Absolute      CMP $4400     $CD  3   4
Absolute,X    CMP $4400,X   $DD  3   4+
Absolute,Y    CMP $4400,Y   $D9  3   4+
Indirect,X    CMP ($44,X)   $C1  2   6
Indirect,Y    CMP ($44),Y   $D1  2   5+

+ add 1 cycle if page boundary crossed

Compare sets flags as if a subtraction had been carried out. If the value in the accumulator is equal or greater than 
the compared value, the Carry will be set. The equal (Z) and sign (S) flags will be set based on equality or lack thereof 
and the sign (i.e. A>=$80) of the accumulator.
*/
