import { TestBed } from '@angular/core/testing';

import { AddressingModes, IOpCodes } from './globals';

import { Cpu, initialCpuState } from './cpuState';

import { BaseOpCode, OpCodeFamily } from './opcode.base';

describe('Base Op Code Tests', () => {

    let cpu: Cpu = null;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [BaseOpCode]
        });
        cpu = initialCpuState();
    });

    describe('BaseOpCode', () => {

        it('executes the action assigned', () => {
            const baseOpCode = new BaseOpCode('TST', 0x01, AddressingModes.Absolute, 0x03, oCpu => oCpu.memory[1] = 2);
            baseOpCode.execute(cpu);
            expect(cpu.memory[1]).toBe(2);
        });
    });

    describe('OpCodeFamily', () => {

        let family: IOpCodes = null;

        beforeEach(() => {
            family = new OpCodeFamily('TST');
        });

        it('errors on trying to execute an invalid op code', () => {
            expect(() => family.execute(cpu, 0x01)).toThrow();
        });

        it('executes the corresponding op code', () => {
            const goodOpCode = new BaseOpCode('TST', 0x01, AddressingModes.Absolute, 0x03, oCpu => oCpu.memory[2] = 3);
            family.register(goodOpCode);
            family.execute(cpu, goodOpCode.value);
            expect(cpu.memory[2]).toBe(3);
        });

        it('registers multiple op codes', () => {
            const goodOpCode = new BaseOpCode('TST', 0x01, AddressingModes.Absolute, 0x03, oCpu => oCpu.memory[2] = 3);
            const anotherGoodOpCode = new BaseOpCode('TST', 0x02, AddressingModes.Immediate, 0x03, oCpu => oCpu.memory[3] = 4);
            family.register(goodOpCode, anotherGoodOpCode);
            family.execute(cpu, goodOpCode.value);
            family.execute(cpu, anotherGoodOpCode.value);
            expect(cpu.memory[2]).toBe(3);
            expect(cpu.memory[3]).toBe(4);
        });

    });
});
