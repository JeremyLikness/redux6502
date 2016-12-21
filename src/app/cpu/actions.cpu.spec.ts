import { Actions,
    cpuPoke,
    cpuStop,
    cpuHalt,
    cpuReset,
    cpuStep
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
      expect(cpuPoke(1, 2)).toEqual({
        type: Actions.Poke,
        address: 1,
        value: 2});
    });

    let tuples: IActionPair[] = [
        {action: cpuStop, actionType: Actions.Stop},
        {action: cpuHalt, actionType: Actions.Halt},
        {action: cpuReset, actionType: Actions.Reset},
        {action: cpuStep, actionType: Actions.Step}
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
