import * as assert from "assert";
import {readFileSync} from "fs";
import {parseGPUCoreMemory, parseLastUpdate, parseName, parseSpeed, parseTemps} from "../lib/helper";
import {IGetListRigsRow} from "../lib/interfaces";

const rig: IGetListRigsRow = JSON.parse(readFileSync(__dirname + "/getListRigs.txt").toString())[0];

describe("parseGPUCoreMemory", () => {
    it("should parse GPU core frequencies", () => {
        const result = parseGPUCoreMemory(rig) as any;

        assert(result instanceof Object);
        assert(result.hasOwnProperty("gpuCoreFrequencies"));

        const {gpuCoreFrequencies} = result;

        assert(Array.isArray(gpuCoreFrequencies));
        assert([1145, 1145, 1145, 1145, 1167, 1145].every((f, i) => f === gpuCoreFrequencies[i]));
    });
    it("should parse GPU memory frequencies", () => {
        const result = parseGPUCoreMemory(rig) as any;

        assert(result instanceof Object);
        assert(result.hasOwnProperty("gpuMemoryFrequencies"));

        const {gpuMemoryFrequencies} = result;

        assert(Array.isArray(gpuMemoryFrequencies));
        assert([2100, 2100, 2100, 2100, 2100, 2000].every((f, i) => f === gpuMemoryFrequencies[i]));
    });
});

describe("parseTemps", () => {
    it("should parse GPU temperatures", () => {
        const result = parseTemps(rig) as any;

        assert(result instanceof Object);
        assert(result.hasOwnProperty("temperatures"));

        const {temperatures} = result;

        assert(Array.isArray(temperatures));
        assert([60, 61, 61, 60, 66, 55].every((f, i) => f === temperatures[i]));
    });
    it("should parse GPU fan speeds", () => {
        const result = parseTemps(rig) as any;

        assert(result instanceof Object);
        assert(result.hasOwnProperty("fansSpeed"));

        const {fansSpeed} = result;

        assert(Array.isArray(fansSpeed));
        assert([42, 48, 48, 48, 100, 96].every((f, i) => f === fansSpeed[i]));
    });
});

describe("parseSpeed", () => {
    it("should parse GPU hash rates", () => {
        const result = parseSpeed(rig) as any;

        assert(result instanceof Object);
        assert(result.hasOwnProperty("hashRates"));

        const {hashRates} = result;

        assert(Array.isArray(hashRates));
        assert([29.08, 29.09, 29.04, 29.08, 28.99, 22.23].every((f, i) => f === hashRates[i]));
    });
    it("should parse total GPU hash rate", () => {
        const result = parseSpeed(rig) as any;

        assert(result instanceof Object);
        assert(result.hasOwnProperty("hashRate"));

        const {hashRate} = result;

        assert(typeof hashRate === "number");
        assert.equal(hashRate, 167.51);
    });
});

describe("parseLastUpdate", () => {
    it("should parse uptime", () => {
        const result = parseLastUpdate(rig) as any;

        assert(result instanceof Object);
        assert(result.hasOwnProperty("uptime"));

        const {uptime} = result;

        assert(typeof uptime === "string");
        assert.equal(uptime, "6 days, 6 hours, 53 minutes");
    });
    it("should parse mining program start date", () => {
        const result = parseLastUpdate(rig) as any;

        assert(result instanceof Object);
        assert(result.hasOwnProperty("programStartDate"));

        const {programStartDate} = result;

        assert(programStartDate instanceof Date);
        assert.equal(programStartDate.getTime(), 1518336406000);
    });
    it("should parse server time", () => {
        const result = parseLastUpdate(rig) as any;

        assert(result instanceof Object);
        assert(result.hasOwnProperty("serverTime"));

        const {serverTime} = result;

        assert(serverTime instanceof Date);
        assert.equal(serverTime.getTime(), 1518879584000);
    });
    it("should parse last seen date", () => {
        const result = parseLastUpdate(rig) as any;

        assert(result instanceof Object);
        assert(result.hasOwnProperty("lastSeenDate"));

        const {lastSeenDate} = result;

        assert(lastSeenDate instanceof Date);
        assert.equal(lastSeenDate.getTime(), 1518879564000);
    });
    it("should parse total of restart", () => {
        const result = parseLastUpdate(rig) as any;

        assert(result instanceof Object);
        assert(result.hasOwnProperty("totalRestarts"));

        const {totalRestarts} = result;

        assert(typeof totalRestarts === "number");
        assert.equal(totalRestarts, 282);
    });
});

describe("parseName", () => {
    it("should parse kernel", () => {
        const result = parseName(rig) as any;

        assert(result instanceof Object);
        assert(result.hasOwnProperty("kernel"));

        const {kernel} = result;

        assert(typeof kernel === "string");
        assert.equal(kernel, "4.11.0-kfd-compute-rocm-rel-1.6-148");
    });
    it("should parse ip", () => {
        const result = parseName(rig) as any;

        assert(result instanceof Object);
        assert(result.hasOwnProperty("ip"));

        const {ip} = result;

        assert(typeof ip === "string");
        assert.equal(ip, "192.168.1.128");
    });
});
