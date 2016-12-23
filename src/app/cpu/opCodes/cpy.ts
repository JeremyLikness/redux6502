/*
CPY (ComPare Y register)

Affects Flags: S Z C

MODE           SYNTAX       HEX LEN TIM
Immediate     CPY #$44      $C0  2   2
Zero Page     CPY $44       $C4  2   3
Absolute      CPY $4400     $CC  3   4

Operation and flag results are identical to equivalent mode accumulator CMP ops.
*/
