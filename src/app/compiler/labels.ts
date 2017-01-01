import { Address, Byte } from '../cpu/globals';
import { ICompiledLine } from './globals';

export interface ILabel {
    address: Address;
    labelName: string;
    dependentLabelName?: string;
    offset: Byte;
}

export const findLabel: (label: string, labels: ILabel[]) => ILabel = (label: string, labels: ILabel[]) => {
    let labelResult: ILabel = null;
    labels.forEach(labelItem => {
        if (labelItem.labelName === label && labelItem.dependentLabelName === undefined) {
            labelResult = labelItem;
        }
    });
    return labelResult;
};

export const parseAbsoluteLabel = (
    parameter: string,
    compiledLine: ICompiledLine,
    labels: ILabel[],
    targetExpr: RegExp,
    labelExpr: RegExp) => {
        let matchArray: RegExpMatchArray = null;
        if (!parameter.match(targetExpr)) {
            if (matchArray = parameter.match(labelExpr)) {
                let label: string = matchArray[1],
                    labelInstance: ILabel = findLabel(label, labels);
                if (labelInstance !== null) {
                    let value: Address = labelInstance.address;
                    parameter = parameter.replace(matchArray[1], value.toString(10));
                } else {
                    compiledLine.label = label;
                    compiledLine.processed = false;
                    parameter = parameter.replace(matchArray[1], '65535');
                }
            }
        }
        return parameter;
};
