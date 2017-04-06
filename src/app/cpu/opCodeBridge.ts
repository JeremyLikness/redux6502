// this bridge registers op codes with the CPU
import { IOpCodes } from './globals';

// constant shared between op codes to register and CPU to map
export const OP_CODES: IOpCodes[] = []; // "static" list of constructed op code families

// aspect @IsOpCode
export function IsOpCode(target: { new () }) {
    OP_CODES.push(new target());
}
