/* tslint:disable:no-unused-variable */

import { TestBed, async } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { CompilerComponent } from './compiler/compiler.component';
import { RegistersComponent } from './cpu/registers/registers.component';
import { CpuControlComponent } from './cpu-control/cpu-control.component';

import { HexPipe } from './hex.pipe';

import { Compiler } from './compiler/compiler';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CPU_STORE } from './cpu/constants';
import { cpuReducer } from './cpu/reducer.cpu';

import { createStore } from 'redux';

const TITLE = '6502 Emulator (NG4, TS, Redux)';

describe('AppComponent', () => {
  beforeEach(() => {
    const store = createStore(cpuReducer);
    TestBed.configureTestingModule({
      declarations: [
        AppComponent,
        CompilerComponent,
        RegistersComponent,
        CpuControlComponent,
        HexPipe
      ],
      imports: [CommonModule, FormsModule],
      providers: [Compiler, { provide: CPU_STORE, useValue: store }]
    });
    TestBed.compileComponents();
  });

  it('should create the app', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));

  it(`should have as title ${TITLE}`, async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app.title).toEqual(TITLE);
  }));

  it('should render title in a h1 tag', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('h1').textContent).toContain(TITLE);
  }));
});
