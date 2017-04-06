/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { CPU_STORE } from '../cpu/constants';
import { cpuReducer } from '../cpu/reducer.cpu';

import { createStore } from 'redux';

import { CpuControlComponent } from './cpu-control.component';

describe('CpuControlComponent', () => {
  let component: CpuControlComponent;
  let fixture: ComponentFixture<CpuControlComponent>;

  beforeEach(async(() => {
    const store = createStore(cpuReducer);
    TestBed.configureTestingModule({
      declarations: [CpuControlComponent],
      providers: [{ provide: CPU_STORE, useValue: store }]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CpuControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
