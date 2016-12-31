import { decompileOp, decompileOps } from './globals';

import { OpCodeValue, Address, Byte } from '../cpu/globals';

import { Cpu, initialCpuState } from '../cpu/cpuState';

import { TestBed } from '@angular/core/testing';

interface IDecompileOpTest {
    bytes: Byte[];
    expected: string;
    test: string;
}

let decompileOpTests: IDecompileOpTest[] = [{
    bytes: [0x0],
    expected: '$C000: ???',
    test: 'decompiles invalid op codes'
}, {
    bytes: [0x6D, 0x00, 0x44],
    expected: '$C000: ADC $4400',
    test: 'decompiles absolute'
}, {
    bytes: [0xBD, 0x22, 0xD0],
    expected: '$C000: LDA $D022, X',
    test: 'decompiles absolute, X'
}, {
    bytes: [0x39, 0xEE, 0xFF],
    expected: '$C000: AND $FFEE, Y',
    test: 'decompiles absolute, Y'
}, {
    bytes: [0xC9, 0x7F],
    expected: '$C000: CMP #$7F',
    test: 'decompiles immediate'
}, {
    bytes: [0x81, 0x44],
    expected: '$C000: STA ($44, X)',
    test: 'decompiles indexed, indirect X'
}, {
    bytes: [0x6C, 0x00, 0xD0],
    expected: '$C000: JMP ($D000)',
    test: 'decompiles indirect'
}, {
    bytes: [0xF1, 0x44],
    expected: '$C000: SBC ($44), Y',
    test: 'decompiles indirect, indexed Y'
}, {
    bytes: [0x10, 0x02],
    expected: '$C000: BPL $C004',
    test: 'decompiles relative'
}, {
    bytes: [0x0A],
    expected: '$C000: ASL',
    test: 'decompiles single'
}, {
    bytes: [0x86, 0x1E],
    expected: '$C000: STX $1E',
    test: 'decompiles zero page'
}, {
    bytes: [0x94, 0x80],
    expected: '$C000: STY $80, X',
    test: 'decompiles zero page, X'
}, {
    bytes: [0x96, 0x02],
    expected: '$C000: STX $02, Y',
    test: 'decompiles zero page, Y'
}];

describe('decompileOp', () => {

    let cpu: Cpu = null;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ decompileOp ]
        });

        cpu = initialCpuState();
    });

    decompileOpTests.forEach(test => {
        it (test.test, () => {
            let mem = 0xC000 + test.bytes.length,
                memory = [...test.bytes];
            while (mem > 0) {
                mem -= 1;
                cpu.memory[mem] = memory.pop();
            }
            let result = decompileOp(cpu, 0xC000);
            expect(result).toBe(test.expected);
        });
    });

    describe('decompileOps', () => {
        it('decompiles the requested lines and returns', () => {
            let code = [0xA2, 0x00, 0xBD, 0x0B, 0xC0, 0xF0, 0x03, 0xE8, 0xD0, 0xF8, 0x00, 0x01,
                        0x02, 0x03, 0x04, 0x05];
            let expected = [
                '$C000: LDX #$00',
                '$C002: LDA $C00B, X',
                '$C005: BEQ $C00A',
                '$C007: INX',
                '$C008: BNE $C002',
                '$C00A: ???',
                '$C00B: ORA ($02, X)'
            ];

            for (let offset = 0; offset < code.length; offset += 1) {
                cpu.memory[0xC000 + offset] = code[offset];
            }

            let result = decompileOps(cpu, 0xC000, 7);
            expect(result).toEqual(expected);
        });
    });
});
