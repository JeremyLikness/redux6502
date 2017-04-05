import { BrowserModule } from '@angular/platform-browser';
import { NgModule, FactoryProvider, forwardRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { FlexLayoutModule } from '@angular/flex-layout';

import { AppComponent } from './app.component';
import { CompilerComponent } from './compiler/compiler.component';

import { Compiler } from './compiler/compiler';

import { cpuReducer } from './cpu/reducer.cpu';
import { CPU_STORE } from './cpu/constants';
import { createStore } from 'redux';

import { AdcFamily } from './cpu/opCodes/adc';
import { AslFamily } from './cpu/opCodes/asl';
import { AndFamily } from './cpu/opCodes/and';
import { BitFamily } from './cpu/opCodes/bit';
import { BranchFamily } from './cpu/opCodes/branches';
import { CmpFamily } from './cpu/opCodes/cmp';
import { CpxFamily } from './cpu/opCodes/cpx';
import { CpyFamily } from './cpu/opCodes/cpy';
import { DecFamily } from './cpu/opCodes/dec';
import { XorFamily } from './cpu/opCodes/eor';
import { FlagFamily } from './cpu/opCodes/flagOps';
import { IncFamily } from './cpu/opCodes/inc';
import { JmpFamily } from './cpu/opCodes/jmp';
import { JsrFamily } from './cpu/opCodes/jsr';
import { LdaFamily } from './cpu/opCodes/lda';
import { LdxFamily } from './cpu/opCodes/ldx';
import { LdyFamily } from './cpu/opCodes/ldy';
import { LsrFamily } from './cpu/opCodes/lsr';
import { NopFamily } from './cpu/opCodes/nop';
import { OrFamily } from './cpu/opCodes/ora';
import { RegisterFamily } from './cpu/opCodes/registers';
import { RolFamily } from './cpu/opCodes/rol';
import { RorFamily } from './cpu/opCodes/ror';
import { RtsFamily } from './cpu/opCodes/rts';
import { SbcFamily } from './cpu/opCodes/sbc';
import { StaFamily } from './cpu/opCodes/sta';
import { StackFamily } from './cpu/opCodes/stack';
import { StxFamily } from './cpu/opCodes/stx';
import { StyFamily } from './cpu/opCodes/sty';
import { RegistersComponent } from './cpu/registers/registers.component';
import { HexPipe } from './hex.pipe';
import { CpuControlComponent } from './cpu-control/cpu-control.component';

export function storeFactory() {
  return createStore(cpuReducer);
}

const storeProvider: FactoryProvider = {
  provide: CPU_STORE,
  useFactory: storeFactory
};

@NgModule({
  declarations: [
    AppComponent,
    CompilerComponent,
    RegistersComponent,
    HexPipe,
    CpuControlComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    FlexLayoutModule
  ],
  providers: [
    storeProvider,
    Compiler,
    AdcFamily,
    AslFamily,
    AndFamily,
    BitFamily,
    BranchFamily,
    CmpFamily,
    CpxFamily,
    CpyFamily,
    DecFamily,
    XorFamily,
    FlagFamily,
    IncFamily,
    JmpFamily,
    JsrFamily,
    LdaFamily,
    LdxFamily,
    LdyFamily,
    LsrFamily,
    NopFamily,
    OrFamily,
    RegisterFamily,
    RolFamily,
    RorFamily,
    RtsFamily,
    SbcFamily,
    StaFamily,
    StaFamily,
    StxFamily,
    StyFamily
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
