import { Compiler } from './compiler';
import { ICompiledLine, newCompiledLine } from './globals';
import { INVALID_DCB } from './constants';

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
                let result = compiler.parseOpCode([], 'DCB 255, 10', compiledLine);
                expect(result.code).toEqual([255, 10]);
            });

            it('loads hexadecimal bytes', () => {
                let result = compiler.parseOpCode([], 'DCB $10, $FA', compiledLine);
                expect(result.code).toEqual([0x10, 0xFA]);
            });
        });

    });
});
