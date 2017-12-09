"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function parseGPUCoreMemory(rig) {
    var gpuCoreMemory = /<small>([0-9 ]+)*\([0-9]+\)<br \/>([0-9 ]+)*<\/small>/.exec(rig.gpuCoreMemory);
    var gpuCoreFrequencies = gpuCoreMemory
        ? gpuCoreMemory[1].split(" ").filter(function (f) { return f.length; }).map(Number)
        : [NaN];
    var gpuMemoryFrequencies = gpuCoreMemory
        ? gpuCoreMemory[2].split(" ").filter(function (f) { return f.length; }).map(Number)
        : [NaN];
    return { gpuCoreFrequencies: gpuCoreFrequencies, gpuMemoryFrequencies: gpuMemoryFrequencies };
}
exports.parseGPUCoreMemory = parseGPUCoreMemory;
function parseTemps(rig) {
    var temps = /="([0-9 ]+)[^<]*<br \/>([0-9 ]+)/.exec(rig.temps);
    var temperatures = temps ? temps[1].split(" ").filter(function (f) { return f.length; }).map(Number) : [NaN];
    var fansSpeed = temps ? temps[2].split(" ").filter(function (f) { return f.length; }).map(Number) : [NaN];
    return { temperatures: temperatures, fansSpeed: fansSpeed };
}
exports.parseTemps = parseTemps;
function parseSpeed(rig) {
    var hashRates = rig.speed
        .split("<br />")
        .map(function (speed) { return /GPU[0-9]+: ([0-9.]+) ([KMG]?)H\/s/g.exec(speed); })
        .filter(function (speed) { return !!speed; })
        .map(function (speed) {
        return speed ? Number(speed[1]) * Math.pow(1000, speed[2].indexOf("KMG") + 1) : NaN;
    });
    var hashRate = hashRates.reduce(function (acc, v) { return acc + v; });
    return { hashRates: hashRates, hashRate: hashRate };
}
exports.parseSpeed = parseSpeed;
function parseLastUpdate(rig) {
    var rawUptime = /Rig Uptime: up([^<]+)/.exec(rig.lastUpdate);
    var uptime = rawUptime ? rawUptime[1].trim() : "";
    var rawProgramStartDate = /Miner program started: ([^<]+)/.exec(rig.lastUpdate);
    var programStartDate = rawProgramStartDate ? new Date(rawProgramStartDate[1].trim()) : new Date(NaN);
    var rawServerTime = /NOW server time is: ([^<]+)/.exec(rig.lastUpdate);
    var serverTime = rawServerTime ? new Date(rawServerTime[1].trim()) : new Date(NaN);
    var rawLastSeenDate = /Last seen: ([^<]+)/.exec(rig.lastUpdate);
    var lastSeenDate = rawLastSeenDate ? new Date(rawLastSeenDate[1].trim()) : new Date(NaN);
    var rowTotalRestarts = /Total restarts: ([^"]+)/.exec(rig.lastUpdate);
    var totalRestarts = rowTotalRestarts ? Number(rowTotalRestarts[1].trim()) : NaN;
    return { uptime: uptime, programStartDate: programStartDate, serverTime: serverTime, lastSeenDate: lastSeenDate, totalRestarts: totalRestarts };
}
exports.parseLastUpdate = parseLastUpdate;
function parseName(rig) {
    var rawLinuxKernel = /Linux Kernel: ([^<]+)/.exec(rig.name);
    var kernel = rawLinuxKernel ? rawLinuxKernel[1].trim() : "";
    var rawIp = /IP: ([^<]+)/.exec(rig.name);
    var ip = rawIp ? rawIp[1].trim() : "";
    return { kernel: kernel, ip: ip };
}
exports.parseName = parseName;
