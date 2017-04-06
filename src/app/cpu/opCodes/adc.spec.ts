import { Address, OpCodeValue, Byte, poke } from '../globals';

import { Flags } from '../constants';

import { Cpu, initialCpuState } from '../cpuState';

import { TestBed } from '@angular/core/testing';

import { AdcFamily } from './adc';

interface ITestAddAccumulator {
    programCounter: Address;
    programCounterAfter: Address;
    setUpAddress: Address;
    opCode: OpCodeValue;
    setUpBytes: Byte[];
    xValue: Byte;
    yValue: Byte;
    test: string;
}

// these tests just ensure ADC accesses the correct byte
// for in-depth tests for the add operation and flags, look at math.spec

const tests: ITestAddAccumulator[] = [{
    programCounter: 0x00,
    programCounterAfter: 0x01,
    opCode: 0x69,
    setUpAddress: 0x00,
    setUpBytes: [0x7F],
    xValue: 0x0,
    yValue: 0x0,
    test: 'ADC immediate adds the correct byte'
}, {
    programCounter: 0x00,
    programCounterAfter: 0x01,
    opCode: 0x65,
    setUpAddress: 0x00,
    setUpBytes: [0x01, 0x7F],
    xValue: 0x0,
    yValue: 0x0,
    test: 'ADC zero page adds the correct byte'
}, {
    programCounter: 0x00,
    programCounterAfter: 0x01,
    opCode: 0x75,
    setUpAddress: 0x00,
    setUpBytes: [0x01, 0x00, 0x7F],
    xValue: 0x01,
    yValue: 0x0,
    test: 'ADC zero page, X adds the correct byte'
}, {
    programCounter: 0x00,
    programCounterAfter: 0x02,
    opCode: 0x6D,
    setUpAddress: 0x00,
    setUpBytes: [0x02, 0x00, 0x7F],
    xValue: 0x00,
    yValue: 0x0,
    test: 'ADC absolute adds the correct byte'
}, {
    programCounter: 0x00,
    programCounterAfter: 0x02,
    opCode: 0x7D,
    setUpAddress: 0x00,
    setUpBytes: [0x02, 0x00, 0x00, 0x7F],
    xValue: 0x01,
    yValue: 0x0,
    test: 'ADC absolute, X adds the correct byte'
}, {
    programCounter: 0x00,
    programCounterAfter: 0x02,
    opCode: 0x79,
    setUpAddress: 0x00,
    setUpBytes: [0x02, 0x00, 0x00, 0x7F],
    xValue: 0x0,
    yValue: 0x01,
    test: 'ADC absolute, Y adds the correct byte'
}, {
    programCounter: 0x00,
    programCounterAfter: 0x01,
    opCode: 0x61,
    setUpAddress: 0x00,
    setUpBytes: [0x00, 0x03, 0x00, 0x7F],
    xValue: 0x01,
    yValue: 0x0,
    test: 'ADC indexed, indirect X adds the correct byte'
}, {
    programCounter: 0x00,
    programCounterAfter: 0x01,
    opCode: 0x71,
    setUpAddress: 0x00,
    setUpBytes: [0x00, 0x00, 0x7F],
    xValue: 0x0,
    yValue: 0x02,
    test: 'ADC indirect, indexed Y adds the correct byte'
}];

const apply = (cpu: Cpu, test: ITestAddAccumulator) => {
    cpu.rPC = test.programCounter;
    cpu.rA = 0x01;
    poke(cpu, test.setUpAddress, test.setUpBytes);
    cpu.rX = test.xValue;
    cpu.rY = test.yValue;
};

describe('adc', () => {

    let adc: AdcFamily = null;
    let cpu: Cpu = null;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [AdcFamily]
        });

        adc = new AdcFamily();
        cpu = initialCpuState();

    });

    describe('flags', () => {

        it('sets the sign flag', () => {
            cpu.rA = 0x80;
            cpu.memory[cpu.rPC] = 0x01;
            adc.execute(cpu, 0x69);
            expect(cpu.rP & Flags.NegativeFlag).toBeTruthy();
        });

        it('sets the zero flag', () => {
            cpu.rA = 0x00;
            adc.execute(cpu, 0x69);
            expect(cpu.rP & Flags.ZeroFlag).toBeTruthy();
        });

    });

    tests.forEach(test => {
        it(test.test, () => {
            apply(cpu, test);
            adc.execute(cpu, test.opCode);
            expect(cpu.rA).toBe(0x80);
            expect(cpu.rPC).toBe(test.programCounterAfter);
        });
    });

});
