/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement, ValueProvider } from '@angular/core';

import { CPU_STORE, Flags } from '../constants';
import { cpuSetPC } from '../actions.cpu';
import { cpuReducer } from '../reducer.cpu';
import { initialCpuState } from '../cpuState';

import { createStore } from 'redux';

import { RegistersComponent } from './registers.component';
import { HexPipe } from '../../hex.pipe';

describe('RegistersComponent', () => {
  let component: RegistersComponent;
  let fixture: ComponentFixture<RegistersComponent>;

  beforeEach(async(() => {
    let store = createStore(cpuReducer);
    TestBed.configureTestingModule({
      declarations: [ RegistersComponent, HexPipe ],
      providers: [<ValueProvider>{ provide: CPU_STORE, useValue: store }]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegistersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should intialize the CPU', () => {
    expect(component.cpu).toEqual(initialCpuState());
  });

  it('should respond to store changes', () => {
    let expected = initialCpuState();
    component.store.dispatch(cpuSetPC(0xC000));
    fixture.detectChanges();
    expect(component.cpu.rPC).toEqual(0xC000);
  });

  describe('registerSet', () => {
    it('should return true when the register is set', () => {
      component.cpu.rP = Flags.NegativeFlagSet;
      expect(component.registerSet(7)).toBe(true);
    });
    it('should return false when the register is not set', () => {
      component.cpu.rP = Flags.NegativeFlagReset;
      expect(component.registerSet(7)).toBe(false);
    });
  })
});
