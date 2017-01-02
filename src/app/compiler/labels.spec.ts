import { ILabel, findLabel, parseAbsoluteLabel } from './labels';

import { ICompiledLine, newCompiledLine } from './globals';

import { CompilerPatterns } from './constants';

import { TestBed } from '@angular/core/testing';

describe ('labels', () => {

    let labels: ILabel[] = [];

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ findLabel ]
        });

        labels = [{
            address: 0xC000,
            labelName: 'FOO',
            dependentLabelName: 'BAR',
            offset: 0x01
        }, {
            address: 0xD000,
            labelName: 'BAR',
            offset: 0x02
        }];
    });

    describe('findLabel', () => {


        it('returns null when a label is not found', () => {
            expect(findLabel('TEST', labels)).toBeNull();
        });

        it('returns null if the label is dependent', () => {
            expect(findLabel('FOO', labels)).toBeNull();
        });

        it('returns the label when the label is found', () => {
            expect(findLabel('BAR', labels)).toEqual(labels[1]);
        });

    });

    describe('parseAbsoluteLabel', () => {

        it('properly ignores an absolute hex address', () => {
            let result = parseAbsoluteLabel(
                '$C000',
                newCompiledLine(),
                labels,
                CompilerPatterns.absoluteHex,
                CompilerPatterns.absoluteLabel);
            expect(result.parameter).toBe('$C000');
        });

        it('properly ignores a decimal absolute address', () => {
            let result = parseAbsoluteLabel(
                '49152',
                newCompiledLine(),
                labels,
                CompilerPatterns.absolute,
                CompilerPatterns.absoluteLabel);
            expect(result.parameter).toBe('49152');
        });

        it('sets the line to not processed and address to 65535 when label is not found', () => {
            let newLine = newCompiledLine();
            newLine.processed = true;
            Object.freeze(newLine);
            let result = parseAbsoluteLabel(
                'TEST',
                newLine,
                labels,
                CompilerPatterns.absolute,
                CompilerPatterns.absoluteLabel);
            expect(result.parameter).toBe('65535');
            expect(result.compiledLine.label).toBe('TEST');
            expect(result.compiledLine.processed).toBe(false);
        });

        it('returns the parameter as an absolute address when the label is found', () => {
            let result = parseAbsoluteLabel(
                'BAR',
                newCompiledLine(),
                labels,
                CompilerPatterns.absolute,
                CompilerPatterns.absoluteLabel);
            expect(result.parameter).toBe('53248');
        });
    });

});
