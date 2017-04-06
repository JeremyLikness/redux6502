import { Compiler, moveAddress } from './compiler';
import { ICompiledLine, newCompiledLine } from './globals';
import { Memory } from '../cpu/constants';
import { ILabel } from './labels';

import { TestBed } from '@angular/core/testing';

describe('Compiler', () => {

    let compiler: Compiler = null;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [Compiler]
        });

        compiler = new Compiler();
    });

    it('instantiates successfully', () => {
        expect(compiler).not.toBeNull();
    });

    describe('moveAddress', () => {

        it('returns null for no move', () => {
            expect(moveAddress('LDA #$00')).toBeNull();
        });

        it('throws an exception when move is out of range', () => {
            expect(() => moveAddress('* = $FFFFF')).toThrow();
        });

        it('parses hexadecimal addresses', () => {
            expect(moveAddress('*= $C000')).toBe(0xC000);
        });

        it('parses decimal addresses', () => {
            expect(moveAddress('* =49152 ')).toBe(0xC000);
        });

    });

    describe('compile', () => {

        it('computes the stats', () => {
            const result = compiler.compile('* = $C000\n' +
                'LABEL: asl\n' +
                'LABEL2 = LaBEL + 6\n' +
                '$C001: ASL\n' +
                'BMI LABEL\n' +
                'BPL LABEL2');

            expect(result.bytes).toBe(6);
            expect(result.compiledLines.length).toBe(4);
            expect(result.labels.length).toBe(2);
            expect(result.memoryTags).toBe(1);
            expect(result.ellapsedTimeMilliseconds).toBeGreaterThanOrEqual(0);
        });

    });

    describe('compileAndParseLabels', () => {

        it('ignores comments', () => {
            const result = compiler.compileAndParseLabels([' ;comment']);
            expect(result.lines).toBe(0);
            expect(result.bytes).toBe(0);
        });

        it('ignores empty lines', () => {
            const result = compiler.compileAndParseLabels([' ',
                'ASL',
                ' ']);
            expect(result.lines).toBe(1);
            expect(result.bytes).toBe(1);
        });

        it('supports moving the address', () => {
            const result = compiler.compileAndParseLabels(['* = $C000', 'ASL']);
            expect(result.lines).toBe(2);
            expect(result.bytes).toBe(1);
            expect(result.compiledLines[0].address).toBe(0xC000);
        });

        it('supports labels', () => {
            const result = compiler.compileAndParseLabels([
                'LABEL: ASL'
            ]);
            expect(result.bytes).toBe(1);
            expect(result.labels.length).toBe(1);
            expect(result.labels[0].labelName).toBe('LABEL');
            expect(result.labels[0].address).toBe(Memory.DefaultStart);
        });

        it('supports label math', () => {
            const result = compiler.compileAndParseLabels([
                'FIRST: ASL',
                'SECOND = FIRST + 5'
            ]);
            expect(result.bytes).toBe(1);
            expect(result.labels.length).toBe(2);
            expect(result.labels[1].address).toBe(result.labels[0].address + 5);
        });

        it('supports hex memory tags', () => {
            const result = compiler.compileAndParseLabels([
                '$C000: ASL'
            ]);
            expect(result.bytes).toBe(1);
            expect(result.compiledLines[0].address).toBe(0xC000);
        });

        it('supports decimal memory tags', () => {
            const result = compiler.compileAndParseLabels([
                '49152: ASL'
            ]);
            expect(result.bytes).toBe(1);
            expect(result.compiledLines[0].address).toBe(0xC000);
        });

        it('throws when memory tag is out of range', () => {
            expect(() => compiler.compileAndParseLabels([
                '65536: ASL'
            ])).toThrow();
        });

        it('throws on invalid assembly', () => {
            expect(() => compiler.compileAndParseLabels([
                '65536: XYZ $FOO'
            ])).toThrow();
        });
    });

    describe('parseOpCode', () => {

        let compiledLine: ICompiledLine = null;

        beforeEach(() => compiledLine = newCompiledLine());

        it('throws on invalid operation', () => {
            expect(() => compiler.parseOpCode([], 'LDZ #$00', compiledLine))
                .toThrow();
        });

        describe('DCB', () => {

            it('throws on no list', () => {
                expect(() => compiler.parseOpCode([], 'DCB', compiledLine))
                    .toThrow();
            });

            it('throws on invalid value', () => {
                expect(() => compiler.parseOpCode([], 'DCB 255, 256', compiledLine))
                    .toThrow();
            });

            it('loads decimal bytes', () => {
                Object.freeze(compiledLine);
                const result = compiler.parseOpCode([], 'DCB 255, 10', compiledLine);
                expect(result.code).toEqual([255, 10]);
            });

            it('loads hexadecimal bytes', () => {
                Object.freeze(compiledLine);
                const result = compiler.parseOpCode([], 'DCB $10, $FA', compiledLine);
                expect(result.code).toEqual([0x10, 0xFA]);
            });
        });

        describe('branches', () => {

            it('handles an absolute label', () => {
                const labels: ILabel[] = [{
                    address: 0xC000,
                    labelName: 'FOO',
                    offset: 0
                }];
                compiledLine.address = 0xC002;
                Object.freeze(compiledLine);
                const result = compiler.parseOpCode(labels, 'BMI FOO', compiledLine);
                expect(result.code).toEqual([0x30, 0xFC]);
            });

            it('handles an absolute address', () => {
                compiledLine.address = 0xC002;
                Object.freeze(compiledLine);
                const result = compiler.parseOpCode([], 'BMI $C000', compiledLine);
                expect(result.code).toEqual([0x30, 0xFC]);
            });

            it('throws if no address', () => {
                expect(() => compiler.parseOpCode([], 'BMI', compiledLine)).toThrow();
            });

            it('throws if branch is too far back', () => {
                expect(() => compiler.parseOpCode([], 'BMI $BF80', compiledLine)).toThrow();
            });

            it('throws if branch is too far ahead', () => {
                expect(() => compiler.parseOpCode([], 'BMI $C082', compiledLine)).toThrow();
            });
        });

        describe('single mode', () => {

            it('throws if operation does not support single mode', () => {
                expect(() => compiler.parseOpCode([], 'LDA', compiledLine)).toThrow();
            });

            it('sets the op code successfully', () => {
                Object.freeze(compiledLine);
                const result = compiler.parseOpCode([], 'ASL', compiledLine);
                expect(result.code).toEqual([0x0A]);
            });

        });

        describe('indexed indirect X mode', () => {

            it('throws if the operation attempts to access a non-zero page', () => {
                expect(() => compiler.parseOpCode([], 'LDA (256, X)', compiledLine)).toThrow();
            });

            it('throws if there are extraneous codes on the line that are not comments', () => {
                expect(() => compiler.parseOpCode([], 'LDA ($10,X) YZ', compiledLine)).toThrow();
            });

            it('throws if the op code does not support the addressing mode', () => {
                expect(() => compiler.parseOpCode([], 'LDX ($10, X)', compiledLine)).toThrow();
            });

            it('compiles the indexed indirect x code properly', () => {
                Object.freeze(compiledLine);
                const result = compiler.parseOpCode([], 'LDA ($10,X)', compiledLine);
                expect(result.code).toEqual([0xA1, 0x10]);
            });

        });

        describe('indirect indexed Y mode', () => {

            it('throws if the operation attempts to access a non-zero page', () => {
                expect(() => compiler.parseOpCode([], 'LDA (256), Y', compiledLine)).toThrow();
            });

            it('throws if there are extraneous codes on the line that are not comments', () => {
                expect(() => compiler.parseOpCode([], 'LDA ($10),Y YZ', compiledLine)).toThrow();
            });

            it('throws if the op code does not support the addressing mode', () => {
                expect(() => compiler.parseOpCode([], 'LDY ($10), Y', compiledLine)).toThrow();
            });

            it('compiles the indirected indexed Y code properly', () => {
                Object.freeze(compiledLine);
                const result = compiler.parseOpCode([], 'LDA ($10),Y', compiledLine);
                expect(result.code).toEqual([0xB1, 0x10]);
            });

        });

        describe('immediate mode', () => {

            describe('with labels', () => {

                it('gets the low value of a label address', () => {
                    Object.freeze(compiledLine);
                    const labels: ILabel[] = [{
                        address: 0xCC11,
                        labelName: 'MYLABEL',
                        offset: 0
                    }];
                    const result = compiler.parseOpCode(labels, 'LDA #<MYLABEL', compiledLine);
                    expect(result.code).toEqual([0xA9, 0x11]);
                    expect(result.processed).toBe(true);
                });

                it('gets the high value of a label address', () => {
                    Object.freeze(compiledLine);
                    const labels: ILabel[] = [{
                        address: 0xCC11,
                        labelName: 'MYLABEL',
                        offset: 0
                    }];
                    const result = compiler.parseOpCode(labels, 'LDA #>MYLABEL', compiledLine);
                    expect(result.code).toEqual([0xA9, 0xCC]);
                    expect(result.processed).toBe(true);
                });

                it('sets processed to false and puts 0 value when label not found', () => {
                    Object.freeze(compiledLine);
                    const result = compiler.parseOpCode([], 'LDA #>MYLABEL', compiledLine);
                    expect(result.code).toEqual([0xA9, 0x00]);
                    expect(result.processed).toBe(false);
                });

            });

            describe('without labels', () => {

                it('throws for immediate out of range', () => {
                    expect(() => {
                        compiler.parseOpCode([], 'LDA #256', compiledLine);
                    }).toThrow();
                });

                it('throws with extraneous assembly', () => {
                    expect(() => {
                        compiler.parseOpCode([], 'LDA #255 XY', compiledLine);
                    }).toThrow();
                });

                it('throws with invalid op code', () => {
                    expect(() => {
                        compiler.parseOpCode([], 'LDZ #255', compiledLine);
                    }).toThrow();
                });

                it('throws with invalid support', () => {
                    expect(() => {
                        compiler.parseOpCode([], 'TAX #255', compiledLine);
                    }).toThrow();
                });

                it('compiles valid code', () => {
                    Object.freeze(compiledLine);
                    const result = compiler.parseOpCode([], 'LDA #$C0', compiledLine);
                    expect(result.code).toEqual([0xA9, 0xC0]);
                });

            });

        });

    });
});
