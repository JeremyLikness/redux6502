import { Component, OnInit, Inject } from '@angular/core';

import { CPU_STORE } from '../constants';
import { hexHelper } from '../globals';
import { Cpu } from '../cpuState';

import { Store } from 'redux';

@Component({
  selector: 'app-registers',
  templateUrl: './registers.component.html',
  styleUrls: ['./registers.component.css'],
})
export class RegistersComponent implements OnInit {

  public cpu: Cpu;

  constructor(@Inject(CPU_STORE)public store: Store<Cpu>) {
    this.updateRegisters();
  }

  ngOnInit() {
    this.store.subscribe(() => this.updateRegisters());
  }

  public updateRegisters(): void {
    this.cpu = this.store.getState();
  }

  public registerSet(bit: number): boolean {
    let mask = Math.pow(2, bit);
    return !!(this.cpu.rP & mask);
  }

}
