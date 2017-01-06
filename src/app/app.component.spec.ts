/* tslint:disable:no-unused-variable */

import { TestBed, async } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { CompilerComponent } from './compiler/compiler.component';

import { Compiler } from './compiler/compiler';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CPU_STORE } from './cpu/constants';
import { cpuReducer } from './cpu/reducer.cpu';

import { createStore } from 'redux';

describe('AppComponent', () => {
  beforeEach(() => {
    let store = createStore(cpuReducer);
    TestBed.configureTestingModule({
      declarations: [
        AppComponent, CompilerComponent
      ],
      imports: [ CommonModule, FormsModule ],
      providers: [ Compiler, { provide: CPU_STORE, useValue: store } ]
    });
    TestBed.compileComponents();
  });

  it('should create the app', async(() => {
    let fixture = TestBed.createComponent(AppComponent);
    let app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));

  it(`should have as title '6502 Emulator (NG2, TS, Redux)'`, async(() => {
    let fixture = TestBed.createComponent(AppComponent);
    let app = fixture.debugElement.componentInstance;
    expect(app.title).toEqual('6502 Emulator (NG2, TS, Redux)');
  }));

  it('should render title in a h1 tag', async(() => {
    let fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    let compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('h1').textContent).toContain('6502 Emulator (NG2, TS, Redux)');
  }));
});
