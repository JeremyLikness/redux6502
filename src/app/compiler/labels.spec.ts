import {
    ILabel,
    findLabel,
    parseAbsoluteLabel,
    resolveLabels,
    updateLabels,
    parseLabelMath
} from './labels';

import { ICompiledLine, ICompilerResult, newCompiledLine } from './globals';

import { AddressingModes } from '../cpu/globals';

import { CompilerPatterns } from './constants';

import { TestBed } from '@angular/core/testing';

const freezeResult = (result: ICompilerResult) => {
    Object.freeze(result);
    result.compiledLines.forEach(line => Object.freeze(line));
    Object.freeze(result.compiledLines);
    result.labels.forEach(label => Object.freeze(label));
    Object.freeze(result.labels);
};

const freezeLabels = (labels: ILabel[]) => {
    labels.forEach(label => Object.freeze(label));
    Object.freeze(labels);
};

describe('labels', () => {

    let labels: ILabel[] = [];

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [findLabel]
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

    describe('parseLabelMath', () => {
        let mathLabels: ILabel[];

        beforeEach(() => {
            mathLabels = [{
                labelName: 'FOO',
                address: 0xC000,
                offset: 0
            }, {
                labelName: 'BAR',
                address: 0xD000,
                offset: 0
            }];
        });

        it('throws on invalid label math', () => {
            expect(() => parseLabelMath('NEW = FOO + 2 + 4', mathLabels)).toThrow();
        });

        it('throws on duplicate label name', () => {
            expect(() => parseLabelMath('FOO = BAR + 1', mathLabels)).toThrow();
        });

        it('throws on self-referencing label math', () => {
            expect(() => parseLabelMath('FOO = FOO + 1', mathLabels)).toThrow();
        });

        it('sets the offset forward when label math is positive', () => {
            const result = parseLabelMath('NEW = FOO + 1', mathLabels);
            expect(result.labelName).toBe('NEW');
            expect(result.dependentLabelName).toBe('FOO');
            expect(result.offset).toBe(1);
        });

        it('sets the offset backwards when label math is negative', () => {
            const result = parseLabelMath('NEW = BAR - 1', mathLabels);
            expect(result.labelName).toBe('NEW');
            expect(result.dependentLabelName).toBe('BAR');
            expect(result.offset).toBe(-1);
        });
    });

    describe('parseAbsoluteLabel', () => {

        it('properly ignores an absolute hex address', () => {
            const result = parseAbsoluteLabel(
                '$C000',
                newCompiledLine(),
                labels,
                CompilerPatterns.absoluteHex,
                CompilerPatterns.absoluteLabel);
            expect(result.parameter).toBe('$C000');
        });

        it('properly ignores a decimal absolute address', () => {
            const result = parseAbsoluteLabel(
                '49152',
                newCompiledLine(),
                labels,
                CompilerPatterns.absolute,
                CompilerPatterns.absoluteLabel);
            expect(result.parameter).toBe('49152');
        });

        it('sets the line to not processed and address to 65535 when label is not found', () => {
            const newLine = newCompiledLine();
            newLine.processed = true;
            Object.freeze(newLine);
            const result = parseAbsoluteLabel(
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
            const result = parseAbsoluteLabel(
                'BAR',
                newCompiledLine(),
                labels,
                CompilerPatterns.absolute,
                CompilerPatterns.absoluteLabel);
            expect(result.parameter).toBe('53248');
        });
    });

    describe('updateLabels', () => {

        let compiled: ICompilerResult;

        beforeEach(() => {
            compiled = {
                compiledLines: [],
                lines: 0,
                bytes: 0,
                labels: [],
                ellapsedTimeMilliseconds: 0,
                memoryTags: 0
            };
        });

        it('ignores lines that are processed', () => {
            const line = newCompiledLine();
            line.processed = true;
            line.label = 'foo';
            compiled.labels.push({
                address: 0xC000,
                labelName: 'bar',
                offset: 0
            });
            compiled.compiledLines.push(line);
            freezeResult(compiled);
            const result = updateLabels(compiled);
            expect(result).toEqual(compiled);
        });

        it('throws an exception when label cannot be found', () => {
            const line = newCompiledLine();
            line.label = 'foo';
            compiled.labels.push({
                address: 0xC000,
                labelName: 'bar',
                offset: 0
            });
            compiled.compiledLines.push(line);
            expect(() => updateLabels(compiled)).toThrow();
        });

        it('throws when an offset is out of range', () => {
            const line = newCompiledLine();
            line.address = 0xC000;
            line.mode = AddressingModes.Relative;
            line.code = [0x00, 0x00];
            line.label = 'foo';
            compiled.labels.push({
                address: 0xD000,
                labelName: 'foo',
                offset: 0
            });
            compiled.compiledLines.push(line);
            expect(() => updateLabels(compiled)).toThrow();
        });

        it('computes the branch forward when a label is after the compiled line', () => {
            const line = newCompiledLine();
            line.address = 0xC000;
            line.mode = AddressingModes.Relative;
            line.code = [0x00, 0x00];
            line.label = 'foo';
            compiled.labels.push({
                address: 0xC004,
                labelName: 'foo',
                offset: 0
            });
            compiled.compiledLines.push(line);
            freezeResult(compiled);
            const result = updateLabels(compiled);
            expect(result.compiledLines[0].code[1]).toBe(0x02);
        });

        it('computes the branch backwards when a label is before the compiled line', () => {
            const line = newCompiledLine();
            line.address = 0xC000;
            line.mode = AddressingModes.Relative;
            line.code = [0x00, 0x00];
            line.label = 'foo';
            compiled.labels.push({
                address: 0xBFFE,
                labelName: 'foo',
                offset: 0
            });
            compiled.compiledLines.push(line);
            freezeResult(compiled);
            const result = updateLabels(compiled);
            expect(result.compiledLines[0].code[1]).toBe(0xFC);
        });

        it('parses the high bit of a label to immediate mode', () => {
            const line = newCompiledLine();
            line.address = 0xC000;
            line.high = true;
            line.mode = AddressingModes.Single;
            line.code = [0x00, 0x00];
            line.label = 'foo';
            compiled.labels.push({
                address: 0xBFFE,
                labelName: 'foo',
                offset: 0
            });
            compiled.compiledLines.push(line);
            freezeResult(compiled);
            const result = updateLabels(compiled);
            expect(result.compiledLines[0].code[1]).toBe(0xBF);
        });

        it('parses the lo byte of an address to immediate mode', () => {
            const line = newCompiledLine();
            line.address = 0xC000;
            line.high = false;
            line.mode = AddressingModes.Single;
            line.code = [0x00, 0x00];
            line.label = 'foo';
            compiled.labels.push({
                address: 0xBFFE,
                labelName: 'foo',
                offset: 0
            });
            compiled.compiledLines.push(line);
            freezeResult(compiled);
            const result = updateLabels(compiled);
            expect(result.compiledLines[0].code[1]).toBe(0xFE);
        });

        it('parses the full address in absolute mode', () => {
            const line = newCompiledLine();
            line.address = 0xC000;
            line.high = true;
            line.mode = AddressingModes.Single;
            line.code = [0x00, 0x00, 0x00];
            line.label = 'foo';
            compiled.labels.push({
                address: 0xBFFE,
                labelName: 'foo',
                offset: 0
            });
            compiled.compiledLines.push(line);
            freezeResult(compiled);
            const result = updateLabels(compiled);
            expect(result.compiledLines[0].code[1]).toBe(0xFE);
            expect(result.compiledLines[0].code[2]).toBe(0xBF);
        });

        it('throws an exception of the code size is not 2 (relative/immediate) or 3 (absolute)', () => {
            const line = newCompiledLine();
            line.address = 0xC000;
            line.high = true;
            line.mode = AddressingModes.Single;
            line.code = [0x00, 0x00, 0x00, 0x00];
            line.label = 'foo';
            compiled.labels.push({
                address: 0xBFFE,
                labelName: 'foo',
                offset: 0
            });
            compiled.compiledLines.push(line);
            expect(() => updateLabels(compiled)).toThrow();
        });

    });

    describe('resolveLabels', () => {

        let labelResolve: ILabel[];

        beforeEach(() => {
            labelResolve = [];
        });

        it('ignores labels with no dependencies', () => {
            const label = <ILabel>{
                labelName: 'foo',
                address: 0xC000,
                offset: 0
            };
            labelResolve.push(label);
            freezeLabels(labelResolve);
            const result = resolveLabels(labelResolve);
            expect(result).toEqual(labelResolve);
        });

        it('throws when dependent label is not found', () => {
            const label = <ILabel>{
                labelName: 'foo',
                dependentLabelName: 'bar',
                address: 0xC000,
                offset: 0
            };
            labelResolve.push(label);
            expect(() => resolveLabels(labelResolve)).toThrow();
        });

        it('throws when address is out of range', () => {
            const label = <ILabel>{
                labelName: 'foo',
                address: 0xFFFF,
                offset: 0
            }, dependentLabel = <ILabel>{
                labelName: 'bar',
                dependentLabelName: 'foo',
                address: null,
                offset: 10
            };
            labelResolve.push(label);
            labelResolve.push(dependentLabel);
            expect(() => resolveLabels(labelResolve)).toThrow();
        });

        it('updates the label when the dependent label is found', () => {
            const label = <ILabel>{
                labelName: 'foo',
                address: 0xF000,
                offset: 0
            }, dependentLabel = <ILabel>{
                labelName: 'bar',
                dependentLabelName: 'foo',
                address: null,
                offset: 10
            };
            labelResolve.push(label);
            labelResolve.push(dependentLabel);
            freezeLabels(labelResolve);
            const result = resolveLabels(labelResolve);
            expect(result[0]).toEqual(labelResolve[0]);
            expect(result[1].dependentLabelName).toBeUndefined();
            expect(result[1].address).toBe(0xF00A);
        });

    });

});
