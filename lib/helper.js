"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function parseGPUCoreMemory(rig) {
    const gpuCoreMemory = /<small>([0-9 ]+)*\([0-9]+\)<br \/>([0-9 ]+)*<\/small>/.exec(rig.gpuCoreMemory);
    const gpuCoreFrequencies = gpuCoreMemory
        ? gpuCoreMemory[1].split(" ").filter((f) => f.length).map(Number)
        : [NaN];
    const gpuMemoryFrequencies = gpuCoreMemory
        ? gpuCoreMemory[2].split(" ").filter((f) => f.length).map(Number)
        : [NaN];
    return { gpuCoreFrequencies, gpuMemoryFrequencies };
}
exports.parseGPUCoreMemory = parseGPUCoreMemory;
function parseTemps(rig) {
    const temps = /="([0-9 ]+)[^<]*<br \/>([0-9 ]+)/.exec(rig.temps);
    const temperatures = temps ? temps[1].split(" ").filter((f) => f.length).map(Number) : [NaN];
    const fansSpeed = temps ? temps[2].split(" ").filter((f) => f.length).map(Number) : [NaN];
    return { temperatures, fansSpeed };
}
exports.parseTemps = parseTemps;
function parseSpeed(rig) {
    const hashRates = rig.speed
        .split("<br />")
        .map((speed) => /GPU[0-9]+: ([0-9.]+) ([KMG]?)H\/s/g.exec(speed))
        .filter((speed) => !!speed)
        .map((speed) => {
        return speed ? Number(speed[1]) * Math.pow(1000, speed[2].indexOf("KMG") + 1) : NaN;
    });
    const hashRate = hashRates.reduce((acc, v) => acc + v);
    return { hashRates, hashRate };
}
exports.parseSpeed = parseSpeed;
function parseLastUpdate(rig) {
    const rawUptime = /Rig Uptime: up([^<]+)/.exec(rig.lastUpdate);
    const uptime = rawUptime ? rawUptime[1].trim() : "";
    const rawProgramStartDate = /Miner program started: ([^<]+)/.exec(rig.lastUpdate);
    const programStartDate = rawProgramStartDate ? new Date(rawProgramStartDate[1].trim()) : new Date(NaN);
    const rawServerTime = /NOW server time is: ([^<]+)/.exec(rig.lastUpdate);
    const serverTime = rawServerTime ? new Date(rawServerTime[1].trim()) : new Date(NaN);
    const rawLastSeenDate = /Last seen: ([^<]+)/.exec(rig.lastUpdate);
    const lastSeenDate = rawLastSeenDate ? new Date(rawLastSeenDate[1].trim()) : new Date(NaN);
    const rowTotalRestarts = /Total restarts: ([^"]+)/.exec(rig.lastUpdate);
    const totalRestarts = rowTotalRestarts ? Number(rowTotalRestarts[1].trim()) : NaN;
    return { uptime, programStartDate, serverTime, lastSeenDate, totalRestarts };
}
exports.parseLastUpdate = parseLastUpdate;
function parseName(rig) {
    const rawLinuxKernel = /Linux Kernel: ([^<]+)/.exec(rig.name);
    const kernel = rawLinuxKernel ? rawLinuxKernel[1].trim() : "";
    const rawIp = /IP: ([^<]+)/.exec(rig.name);
    const ip = rawIp ? rawIp[1].trim() : "";
    return { kernel, ip };
}
exports.parseName = parseName;
