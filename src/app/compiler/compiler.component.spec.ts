/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CompilerComponent } from './compiler.component';
import { ICompilerResult } from './globals';

import { Compiler } from './compiler';

describe('CompilerComponent', () => {
  let component: CompilerComponent;
  let fixture: ComponentFixture<CompilerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CompilerComponent ],
      imports: [ CommonModule, FormsModule ],
      providers: [ Compiler ]
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
      let result: ICompilerResult = {
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
         compile: (src: string) => { throw 'Test Error'; }
       };
       component.source = 'temp';
       component.compile();
       expect(component.error).toBe(true);
       expect(component.success).toBe(false);
       expect(component.message).toEqual('Test Error');
    });
  });
});
