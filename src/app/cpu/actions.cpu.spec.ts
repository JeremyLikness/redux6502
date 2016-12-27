import { Actions,
    cpuPoke,
    cpuStop,
    cpuHalt,
    cpuReset,
    cpuSetPC,
    cpuStep,
    cpuStart,
    cpuRun
} from './actions.cpu';

import { TestBed } from '@angular/core/testing';

interface IActionPair {
    action: Function;
    actionType: Actions;
}

describe('actions', () => {

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ cpuPoke ]
        });
    });

    it('should create poke action when cpuPoke is called', () => {
      expect(cpuPoke(1, [2])).toEqual({
        type: Actions.Poke,
        address: 1,
        value: [2]});
    });

    it('should create set program counter action when cpuSetPC is called', () => {
      expect(cpuSetPC(1)).toEqual({
        type: Actions.SetPC,
        address: 1});
    });

    it('should create run action when cpuRun is called', () => {
        expect(cpuRun(2)).toEqual({
            type: Actions.Run,
            iterations: 2
        });
    });

    let tuples: IActionPair[] = [
        {action: cpuStop, actionType: Actions.Stop},
        {action: cpuHalt, actionType: Actions.Halt},
        {action: cpuReset, actionType: Actions.Reset},
        {action: cpuStep, actionType: Actions.Step},
        {action: cpuStart, actionType: Actions.Start}
    ];

    tuples.forEach(tuple => {

        it('should create the ' + Actions[tuple.actionType] +
        ' action when ' +
        tuple.action + ' is called', () => {
            expect(tuple.action()).toEqual({
                type: tuple.actionType
            });
        });
    });
});
