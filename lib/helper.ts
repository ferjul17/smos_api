import {IGetListRigsRow} from "./interfaces";

function parseGPUCoreMemory(rig: IGetListRigsRow): { gpuCoreFrequencies: number[], gpuMemoryFrequencies: number[] } {
    const gpuCoreMemory = /<small>([0-9 ]+)*\([0-9]+\)<br \/>([0-9 ]+)*<\/small>/.exec(rig.gpuCoreMemory);
    const gpuCoreFrequencies = gpuCoreMemory
        ? gpuCoreMemory[1].split(" ").filter((f) => f.length).map(Number)
        : [NaN];
    const gpuMemoryFrequencies = gpuCoreMemory
        ? gpuCoreMemory[2].split(" ").filter((f) => f.length).map(Number)
        : [NaN];
    return {gpuCoreFrequencies, gpuMemoryFrequencies};
}

function parseTemps(rig: IGetListRigsRow): { temperatures: number[], fansSpeed: number[] } {
    const temps = /="([0-9 ]+)[^<]*<br \/>([0-9 ]+)/.exec(rig.temps);
    const temperatures = temps ? temps[1].split(" ").filter((f) => f.length).map(Number) : [NaN];
    const fansSpeed = temps ? temps[2].split(" ").filter((f) => f.length).map(Number) : [NaN];
    return {temperatures, fansSpeed};
}

function parseSpeed(rig: IGetListRigsRow): { hashRates: number[], hashRate: number } {
    const hashRates = rig.speed
        .split("<br />")
        .map((speed: string) => /GPU[0-9]+: ([0-9.]+) ([KMG]?)H\/s/g.exec(speed))
        .filter((speed: RegExpExecArray | null): boolean => !!speed)
        .map((speed: RegExpExecArray | null): number => {
            return speed ? Number(speed[1]) * Math.pow(1000, speed[2].indexOf("KMG") + 1) : NaN;
        });
    const hashRate = hashRates.reduce((acc: number, v: number) => acc + v);
    return {hashRates, hashRate};
}

function parseLastUpdate(rig: IGetListRigsRow)
    : { uptime: string, programStartDate: Date, serverTime: Date, lastSeenDate: Date, totalRestarts: number } {
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

    return {uptime, programStartDate, serverTime, lastSeenDate, totalRestarts};
}

function parseName(rig: IGetListRigsRow): {kernel: string, ip: string} {
    const rawLinuxKernel = /Linux Kernel: ([^<]+)/.exec(rig.name);
    const kernel = rawLinuxKernel ? rawLinuxKernel[1].trim() : "";

    const rawIp = /IP: ([^<]+)/.exec(rig.name);
    const ip = rawIp ? rawIp[1].trim() : "";

    return {kernel, ip};
}

export {parseGPUCoreMemory, parseTemps, parseSpeed, parseLastUpdate, parseName};
