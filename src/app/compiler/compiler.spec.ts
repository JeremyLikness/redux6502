import { Compiler } from './compiler';
import { ICompiledLine, newCompiledLine } from './globals';
import { INVALID_DCB } from './constants';
import { ILabel } from './labels';

import { TestBed } from '@angular/core/testing';

describe('Compiler', () => {

    let compiler: Compiler = null;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ Compiler ]
        });

        compiler = new Compiler();
    });

    it('instantiates successfully', () => {
        expect(compiler).not.toBeNull();
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
                    .toThrowError(INVALID_DCB);
            });

            it('throws on invalid value', () => {
                expect(() => compiler.parseOpCode([], 'DCB 255, 256', compiledLine))
                    .toThrow();
            });

            it('loads decimal bytes', () => {
                Object.freeze(compiledLine);
                let result = compiler.parseOpCode([], 'DCB 255, 10', compiledLine);
                expect(result.code).toEqual([255, 10]);
            });

            it('loads hexadecimal bytes', () => {
                Object.freeze(compiledLine);
                let result = compiler.parseOpCode([], 'DCB $10, $FA', compiledLine);
                expect(result.code).toEqual([0x10, 0xFA]);
            });
        });

        describe('branches', () => {

            it('handles an absolute label', () => {
                let labels: ILabel[] = [{
                    address: 0xC000,
                    labelName: 'FOO',
                    offset: 0
                }];
                compiledLine.address = 0xC002;
                Object.freeze(compiledLine);
                let result = compiler.parseOpCode(labels, 'BMI FOO', compiledLine);
                expect(result.code).toEqual([0x30, 0xFC]);
            });

            it('handles an absolute address', () => {
                compiledLine.address = 0xC002;
                Object.freeze(compiledLine);
                let result = compiler.parseOpCode([], 'BMI $C000', compiledLine);
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

            it ('throws if operation does not support single mode', () => {
                expect(() => compiler.parseOpCode([], 'LDA', compiledLine)).toThrow();
            });

            it ('sets the op code successfully', () => {
                Object.freeze(compiledLine);
                let result = compiler.parseOpCode([], 'ASL', compiledLine);
                expect(result.code).toEqual([0x0A]);
            });

        });

    });
});
