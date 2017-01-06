import { Component, OnInit, Inject } from '@angular/core';
import { ICompilerResult } from './globals';
import { Cpu } from '../cpu/cpuState';
import { CPU_STORE, Memory } from '../cpu/constants';
import { Byte, hexHelper } from '../cpu/globals';
import { cpuPoke, cpuSetPC } from '../cpu/actions.cpu';
import { Compiler } from './compiler';

import { Store } from 'redux';

@Component({
  selector: 'app-compiler',
  templateUrl: './compiler.component.html',
  styleUrls: ['./compiler.component.css']
})
export class CompilerComponent implements OnInit {

  public error: boolean = false;
  public success: boolean = false;

  public message: string;
  public source: string = '';
  public compiled: ICompilerResult = null;

  constructor(public compiler: Compiler, @Inject(CPU_STORE)public store: Store<Cpu>) { }

  public compile(): void {
    if (this.source.length) {
      try {
        this.compiled = this.compiler.compile(this.source);
        this.error = false;
        this.success = true;
        this.message = `Parsed ${this.compiled.lines} lines to ${this.compiled.compiledLines.length} compiled lines. ` +
          `Parsed ${this.compiled.labels.length} labels and ${this.compiled.memoryTags} memory tags in ` +
          `${this.compiled.ellapsedTimeMilliseconds}ms`;
      } catch (e) {
        this.success = false;
        this.error = true;
        this.message = e;
      }
    }
  }

  public load(): void {
    if (this.compiled === null) {
      this.error = true;
      this.success = false;
      this.message = 'Nothing to load. Try compiling first!';
      return;
    }

    let address = null, buffer: Byte[] = [], bytes = 0, loAddr = Memory.Size, hiAddr = 0x0;
    for (let idx = 0; idx < this.compiled.compiledLines.length; idx += 1) {
      let line = this.compiled.compiledLines[idx];
      if (line.address !== address) {
        if (address === null) {
          this.store.dispatch(cpuSetPC(line.address));
          loAddr = line.address;
        } else {
          this.store.dispatch(cpuPoke(address, buffer));
          bytes += buffer.length;
          buffer = [];
        }
        address = line.address;
      }
      if (address < loAddr) {
        loAddr = address;
      }
      let temp = buffer.concat(line.code);
      buffer = temp;
      address += line.code.length;
      if (address > hiAddr) {
        hiAddr = address;
      }
    }
    if (address !== null && buffer.length) {
      this.store.dispatch(cpuPoke(address, buffer));
      bytes += buffer.length;
    }
    this.success = true;
    this.error = false;
    this.message = `Successfully loaded ${bytes} bytes to memory from $${hexHelper(loAddr,4)} to $${hexHelper(hiAddr, 4)}`;
  }


  ngOnInit() {
    this.message = 'Ready to compile.';
  }

}
