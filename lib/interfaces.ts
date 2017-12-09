interface IGetListRigsRow {
    check: string;
    console: string;
    gpuCoreMemory: string;
    group: string;
    id: string;
    lastUpdate: string;
    menu: string;
    name: string;
    notes: string;
    speed: string;
    temps: string;
    valueLastUpdate: number;
    version: string;
}

interface IRigInfo {
    id: string;
    gpuCoreFrequencies: number[];
    gpuMemoryFrequencies: number[];
    group: string;
    uptime: string;
    programStartDate: Date;
    serverTime: Date;
    lastSeenDate: Date;
    totalRestarts: number;
    kernel: string;
    ip: string;
    osVersion: string;
    hashRates: number[];
    hashRate: number;
    temperatures: number[];
    fansSpeed: number[];
}

export { IGetListRigsRow, IRigInfo };
