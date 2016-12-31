import { Compiler } from './compiler';

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
});
