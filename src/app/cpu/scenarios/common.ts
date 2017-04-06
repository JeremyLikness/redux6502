import { Cpu } from '../cpuState';

export const perf = (cpu: Cpu) => {
    console.log(`Ran ${cpu.stats.instructionCount} ops in ${cpu.stats.ellapsedMilliseconds}ms` +
        ` at ${cpu.stats.instructionsPerSecond} ips`);
};
