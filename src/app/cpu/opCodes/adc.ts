/* 
ADC (ADd with Carry)

Affects Flags: S V Z C

MODE           SYNTAX       HEX LEN TIM
Immediate     ADC #$44      $69  2   2
Zero Page     ADC $44       $65  2   3
Zero Page,X   ADC $44,X     $75  2   4
Absolute      ADC $4400     $6D  3   4
Absolute,X    ADC $4400,X   $7D  3   4+
Absolute,Y    ADC $4400,Y   $79  3   4+
Indirect,X    ADC ($44,X)   $61  2   6
Indirect,Y    ADC ($44),Y   $71  2   5+ 

ADC results are dependant on the setting of the decimal flag. In decimal mode, addition is carried out on the assumption 
that the values involved are packed BCD (Binary Coded Decimal).

There is no way to add without carry.
*/
