import { Component, OnInit } from '@angular/core';
import { ICompilerResult } from './globals';
import { Compiler } from './compiler';

import { AslFamily } from '../cpu/opCodes/asl';

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

  constructor(public compiler: Compiler) { }

  public compile(): void {
    if (this.source.length) {
      try {
        this.compiled = this.compiler.compile(this.source);
        this.error = false;
        this.success = true;
        this.message = `Compiled ${this.compiled.lines} to (${this.compiled.compiledLines.length}) compiled lines. ` +
          `Parsed ${this.compiled.labels.length} labels and ${this.compiled.memoryTags} memory tags in ` +
          `${this.compiled.ellapsedTimeMilliseconds}ms`;
      } catch (e) {
        this.success = false;
        this.error = true;
        this.message = e;
      }
    }
  }

  ngOnInit() {
    this.message = 'Ready to compile.';
  }

}
