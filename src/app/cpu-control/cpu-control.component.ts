import { Component, OnInit, Inject } from '@angular/core';

import { CPU_STORE } from '../cpu/constants';
import { Cpu } from '../cpu/cpuState';

import { Store } from 'redux';

import {
  cpuHalt,
  cpuStop,
  cpuReset,
  cpuRun,
  cpuStep,
  cpuStart
} from '../cpu/actions.cpu';

@Component({
  selector: 'app-cpu-control',
  templateUrl: './cpu-control.component.html',
  styleUrls: ['./cpu-control.component.css']
})
export class CpuControlComponent implements OnInit {

  public running = false;
  public debug = false;
  public errorState = false;
  public message = '';

  constructor( @Inject(CPU_STORE) public store: Store<Cpu>) {
    this.updateStates();
  }

  ngOnInit() {
    this.store.subscribe(() => this.updateStates());
  }

  public run() {
    if (!this.running && !this.errorState) {
      const cpu = this.store.getState();
      console.log(cpu);
      this.store.dispatch(cpuStart());
      this.runBatch();
    }
  }

  private runBatch() {
    if (this.running && !this.errorState) {
      this.store.dispatch(cpuRun(255));
      setTimeout(() => this.runBatch(), 0);
    }
  }

  public step() {
    if (!this.running && !this.errorState) {
      this.store.dispatch(cpuStart());
      this.store.dispatch(cpuStep());
      this.store.dispatch(cpuStop());
    }
  }

  public stop() {
    if (this.running) {
      this.store.dispatch(cpuStop());
    }
  }

  public halt() {
    if (this.running) {
      this.store.dispatch(cpuHalt());
    }
  }

  public updateStates(): void {
    const cpu = this.store.getState();
    this.running = cpu.controls.runningState;
    this.debug = cpu.debug;
    this.errorState = cpu.controls.errorState;
    if (cpu.controls.errorState) {
      this.message = cpu.controls.errorMessage;
    }
  }
}
