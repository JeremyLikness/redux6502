/*
SBC (SuBtract with Carry)

Affects Flags: S V Z C

MODE           SYNTAX       HEX LEN TIM
Immediate     SBC #$44      $E9  2   2
Zero Page     SBC $44       $E5  2   3
Zero Page,X   SBC $44,X     $F5  2   4
Absolute      SBC $4400     $ED  3   4
Absolute,X    SBC $4400,X   $FD  3   4+
Absolute,Y    SBC $4400,Y   $F9  3   4+
Indirect,X    SBC ($44,X)   $E1  2   6
Indirect,Y    SBC ($44),Y   $F1  2   5+

+ add 1 cycle if page boundary crossed

SBC results are dependant on the setting of the decimal flag. In decimal mode, subtraction is carried out on the assumption 
that the values involved are packed BCD (Binary Coded Decimal).
There is no way to subtract without the carry which works as an inverse borrow. i.e, to subtract you set the carry before 
the operation. If the carry is cleared by the operation, it indicates a borrow occurred.
*/
