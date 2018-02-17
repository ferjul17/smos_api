"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var assert = require("assert");
var fs_1 = require("fs");
var helper_1 = require("../lib/helper");
describe("parseGPUCoreMemory", function () {
    it("should parse GPU core frequencies", function () {
        var rig = JSON.parse(fs_1.readFileSync(__dirname + "/response.txt").toString())[0];
        var result = helper_1.parseGPUCoreMemory(rig);
        assert(result instanceof Object);
        assert(result.hasOwnProperty("gpuCoreFrequencies"));
        var gpuCoreFrequencies = result.gpuCoreFrequencies;
        assert(Array.isArray(gpuCoreFrequencies));
        assert([1145, 1145, 1145, 1145, 1167, 1145].every(function (f, i) { return f === gpuCoreFrequencies[i]; }));
    });
    it("should parse GPU memory frequencies", function () {
        var rig = JSON.parse(fs_1.readFileSync(__dirname + "/response.txt").toString())[0];
        var result = helper_1.parseGPUCoreMemory(rig);
        assert(result instanceof Object);
        assert(result.hasOwnProperty("gpuMemoryFrequencies"));
        var gpuMemoryFrequencies = result.gpuMemoryFrequencies;
        assert(Array.isArray(gpuMemoryFrequencies));
        assert([2100, 2100, 2100, 2100, 2100, 2000].every(function (f, i) { return f === gpuMemoryFrequencies[i]; }));
    });
});
describe("parseTemps", function () {
    it("should parse GPU temperatures", function () {
        var rig = JSON.parse(fs_1.readFileSync(__dirname + "/response.txt").toString())[0];
        var result = helper_1.parseTemps(rig);
        assert(result instanceof Object);
        assert(result.hasOwnProperty("temperatures"));
        var temperatures = result.temperatures;
        assert(Array.isArray(temperatures));
        assert([60, 61, 61, 60, 66, 55].every(function (f, i) { return f === temperatures[i]; }));
    });
    it("should parse GPU fan speeds", function () {
        var rig = JSON.parse(fs_1.readFileSync(__dirname + "/response.txt").toString())[0];
        var result = helper_1.parseTemps(rig);
        assert(result instanceof Object);
        assert(result.hasOwnProperty("fansSpeed"));
        var fansSpeed = result.fansSpeed;
        assert(Array.isArray(fansSpeed));
        assert([42, 48, 48, 48, 100, 96].every(function (f, i) { return f === fansSpeed[i]; }));
    });
});
describe("parseSpeed", function () {
    it("should parse GPU hash rates", function () {
        var rig = JSON.parse(fs_1.readFileSync(__dirname + "/response.txt").toString())[0];
        var result = helper_1.parseSpeed(rig);
        assert(result instanceof Object);
        assert(result.hasOwnProperty("hashRates"));
        var hashRates = result.hashRates;
        assert(Array.isArray(hashRates));
        assert([29.08, 29.09, 29.04, 29.08, 28.99, 22.23].every(function (f, i) { return f === hashRates[i]; }));
    });
    it("should parse total GPU hash rate", function () {
        var rig = JSON.parse(fs_1.readFileSync(__dirname + "/response.txt").toString())[0];
        var result = helper_1.parseSpeed(rig);
        assert(result instanceof Object);
        assert(result.hasOwnProperty("hashRate"));
        var hashRate = result.hashRate;
        assert(typeof hashRate === "number");
        assert.equal(hashRate, 167.51);
    });
});
describe("parseLastUpdate", function () {
    it("should parse uptime", function () {
        var rig = JSON.parse(fs_1.readFileSync(__dirname + "/response.txt").toString())[0];
        var result = helper_1.parseLastUpdate(rig);
        assert(result instanceof Object);
        assert(result.hasOwnProperty("uptime"));
        var uptime = result.uptime;
        assert(typeof uptime === "string");
        assert.equal(uptime, "6 days, 6 hours, 53 minutes");
    });
    it("should parse mining program start date", function () {
        var rig = JSON.parse(fs_1.readFileSync(__dirname + "/response.txt").toString())[0];
        var result = helper_1.parseLastUpdate(rig);
        assert(result instanceof Object);
        assert(result.hasOwnProperty("programStartDate"));
        var programStartDate = result.programStartDate;
        assert(programStartDate instanceof Date);
        assert.equal(programStartDate.getTime(), 1518336406000);
    });
    it("should parse server time", function () {
        var rig = JSON.parse(fs_1.readFileSync(__dirname + "/response.txt").toString())[0];
        var result = helper_1.parseLastUpdate(rig);
        assert(result instanceof Object);
        assert(result.hasOwnProperty("serverTime"));
        var serverTime = result.serverTime;
        assert(serverTime instanceof Date);
        assert.equal(serverTime.getTime(), 1518879584000);
    });
    it("should parse last seen date", function () {
        var rig = JSON.parse(fs_1.readFileSync(__dirname + "/response.txt").toString())[0];
        var result = helper_1.parseLastUpdate(rig);
        assert(result instanceof Object);
        assert(result.hasOwnProperty("lastSeenDate"));
        var lastSeenDate = result.lastSeenDate;
        assert(lastSeenDate instanceof Date);
        assert.equal(lastSeenDate.getTime(), 1518879564000);
    });
    it("should parse total of restart", function () {
        var rig = JSON.parse(fs_1.readFileSync(__dirname + "/response.txt").toString())[0];
        var result = helper_1.parseLastUpdate(rig);
        assert(result instanceof Object);
        assert(result.hasOwnProperty("totalRestarts"));
        var totalRestarts = result.totalRestarts;
        assert(typeof totalRestarts === "number");
        assert.equal(totalRestarts, 282);
    });
});
describe("parseName", function () {
    it("should parse kernel", function () {
        var rig = JSON.parse(fs_1.readFileSync(__dirname + "/response.txt").toString())[0];
        var result = helper_1.parseName(rig);
        assert(result instanceof Object);
        assert(result.hasOwnProperty("kernel"));
        var kernel = result.kernel;
        assert(typeof kernel === "string");
        assert.equal(kernel, "4.11.0-kfd-compute-rocm-rel-1.6-148");
    });
    it("should parse ip", function () {
        var rig = JSON.parse(fs_1.readFileSync(__dirname + "/response.txt").toString())[0];
        var result = helper_1.parseName(rig);
        assert(result instanceof Object);
        assert(result.hasOwnProperty("ip"));
        var ip = result.ip;
        assert(typeof ip === "string");
        assert.equal(ip, "192.168.1.128");
    });
});
