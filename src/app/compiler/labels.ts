import { Address, Byte } from '../cpu/globals';
import { ICompiledLine } from './globals';

export interface ILabel {
    address: Address;
    labelName: string;
    dependentLabelName?: string;
    offset: Byte;
}

export interface ILabelParseResult {
    parameter: string;
    compiledLine: ICompiledLine;
}

export const findLabel: (label: string, labels: ILabel[]) => ILabel = (label: string, labels: ILabel[]) => {
    let labelResult: ILabel = null;
    for (let idx = 0; idx < labels.length; idx += 1) {
        if (labels[idx].labelName === label && labels[idx].dependentLabelName === undefined) {
            return labels[idx];
        }
    }
    return null;
};

export const parseAbsoluteLabel = (
    parameter: string,
    compiledLine: ICompiledLine,
    labels: ILabel[],
    targetExpr: RegExp,
    labelExpr: RegExp) => {
        let result = {
            parameter,
            compiledLine: Object.assign({}, compiledLine)
        };
        let matchArray: RegExpMatchArray = null;
        if (!parameter.match(targetExpr)) {
            if (matchArray = parameter.match(labelExpr)) {
                let label: string = matchArray[1],
                    labelInstance: ILabel = findLabel(label, labels);
                if (labelInstance !== null) {
                    let value: Address = labelInstance.address;
                    result.parameter = parameter.replace(matchArray[1], value.toString(10));
                } else {
                    result.compiledLine.label = label;
                    result.compiledLine.processed = false;
                    result.parameter = parameter.replace(matchArray[1], '65535');
                }
            }
        }
        return result;
};
