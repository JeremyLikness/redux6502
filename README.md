# Redux 6502

A 6502 emulator built with Angular 2, TypeScript, and Redux. 

![Build Status](https://api.travis-ci.org/JeremyLikness/redux6502.svg?branch=master) 

[last build details](https://travis-ci.org/JeremyLikness/redux6502/)


Based on specifications posted at [6502.org](http://6502.org/tutorials/6502opcodes.html). 

Authored by [@JeremyLikness](https://twitter.com/jeremylikness). 

This project was generated with [angular-cli](https://github.com/angular/angular-cli) version 1.0.0-beta.24.

## Background 

The purpose of this project is to provide a robust example of an Angular 2 app written with TypeScript that leverages Redux with proper unit tests. The basic emulation is a pure state machine that simply manages memory and operations. Additional components will overlay the CPU state to provide services such as graphics output, console, compilation of source, and eventually input and output. 

This project builds on previous work with a [Angular 2 6502 Emulator](https://github.com/JeremyLikness/6502emulator) that did not use Redux, and an even older version written with [TypeScript and Angular 1.x](http://t6502.codeplex.com/SourceControl/latest#Source/T6502/default.htm). 

I do accept pull requests if you wish to contribute to help accelerate development. 

## Development server
Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive/pipe/service/class`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).
Before running the tests make sure you are serving the app via `ng serve`.

## Deploying to Github Pages

Run `ng github-pages:deploy` to deploy to Github Pages.

## Further help

To get more help on the `angular-cli` use `ng --help` or go check out the [Angular-CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
