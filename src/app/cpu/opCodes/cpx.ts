/*
CPX (ComPare X register)

Affects Flags: S Z C

MODE           SYNTAX       HEX LEN TIM
Immediate     CPX #$44      $E0  2   2
Zero Page     CPX $44       $E4  2   3
Absolute      CPX $4400     $EC  3   4

Operation and flag results are identical to equivalent mode accumulator CMP ops.
*/
