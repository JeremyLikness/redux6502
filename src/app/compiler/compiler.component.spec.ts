/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CompilerComponent } from './compiler.component';
import { ICompilerResult } from './globals';

import { CPU_STORE } from '../cpu/constants';
import { cpuReducer } from '../cpu/reducer.cpu';

import { createStore } from 'redux';

import { Compiler } from './compiler';

describe('CompilerComponent', () => {
  let component: CompilerComponent;
  let fixture: ComponentFixture<CompilerComponent>;

  beforeEach(async(() => {
    const store = createStore(cpuReducer);
    TestBed.configureTestingModule({
      declarations: [CompilerComponent],
      imports: [CommonModule, FormsModule],
      providers: [Compiler, { provide: CPU_STORE, useValue: store }]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CompilerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize source', () => {
    expect(component.source).toEqual('');
  });

  it('should initialize the compiler', () => {
    expect(component.compiler).toBeDefined();
  });

  describe('compile', () => {

    it('sets error/success flags and message on success', () => {
      const result: ICompilerResult = {
        ellapsedTimeMilliseconds: 5,
        labels: [],
        bytes: 0,
        memoryTags: 0,
        compiledLines: [],
        lines: 0
      };
      component.compiler = <any>{
        compile: (src: string) => result
      };
      component.source = 'temp';
      component.compile();
      expect(component.compiled).toBe(result);
      expect(component.error).toBe(false);
      expect(component.success).toBe(true);
      expect(component.message.length).toBeGreaterThan(0);
    });

    it('sets error message on failure', () => {
      component.compiler = <any>{
        compile: (src: string) => { throw Error('Test Error'); }
      };
      component.source = 'temp';
      component.compile();
      expect(component.error).toBe(true);
      expect(component.success).toBe(false);
      expect(component.message).toEqual('Test Error');
    });
  });

  describe('load', () => {

    let result: ICompilerResult;

    beforeEach(() => {
      result = {
        labels: [],
        memoryTags: 0,
        compiledLines: [{
          address: 0xD000,
          opCode: 0x90,
          code: [0x90, 0x91],
          mode: 1,
          processed: true,
          label: '',
          high: false
        }, {
          address: 0xC000,
          opCode: 0xA0,
          code: [0xA0],
          mode: 1,
          processed: true,
          label: '',
          high: false
        }, {
          address: 0xC001,
          opCode: 0xD0,
          code: [0xD0, 0xD1],
          mode: 1,
          processed: true,
          label: '',
          high: false
        }],
        lines: 0,
        bytes: 0,
        ellapsedTimeMilliseconds: 0
      };
    });

    it('sets error when no compiler result', () => {
      component.load();
      expect(component.error).toBe(true);
      expect(component.success).toBe(false);
      expect(component.message.length).toBeGreaterThan(0);
    });

    it('sets the program counter to the first address encountered', () => {
      component.compiled = result;
      component.load();
      expect(component.store.getState().rPC).toEqual(0xD000);
    });

    it('batches poke statements based on contiguous bytes', () => {
      component.compiled = result;
      let count = 0;
      component.store.subscribe(() => count += 1);
      component.load();
      expect(count).toBe(3); // 1 setPC and 2 cpuPoke
    });

    it('sets success and updates the status on successful load', () => {
      component.compiled = result;
      component.load();
      expect(component.success).toBe(true);
      expect(component.error).toBe(false);
      expect(component.message).toContain('$C000');
      expect(component.message).toContain('$D002');
    });

  });
});
