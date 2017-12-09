"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var cheerio = require("cheerio");
var rp = require("request-promise-native");
var helper_1 = require("./helper");
var HOST = "https://simplemining.net/";
var API = /** @class */ (function () {
    function API(email, password) {
        this.jar = rp.jar();
        this.email = email;
        this.password = password;
    }
    API.prototype.getListRigs = function () {
        return this.getJar().then(function (jar) { return rp({
            method: "GET",
            uri: HOST + "json/getListRigs",
            jar: jar,
            transform: function (body) { return JSON.parse(body); },
        }).then(function (rigs) {
            return rigs.map(function (rig) {
                var _a = helper_1.parseGPUCoreMemory(rig), gpuCoreFrequencies = _a.gpuCoreFrequencies, gpuMemoryFrequencies = _a.gpuMemoryFrequencies;
                var _b = helper_1.parseTemps(rig), temperatures = _b.temperatures, fansSpeed = _b.fansSpeed;
                var _c = helper_1.parseSpeed(rig), hashRates = _c.hashRates, hashRate = _c.hashRate;
                var _d = helper_1.parseLastUpdate(rig), uptime = _d.uptime, programStartDate = _d.programStartDate, serverTime = _d.serverTime, lastSeenDate = _d.lastSeenDate, totalRestarts = _d.totalRestarts;
                var _e = helper_1.parseName(rig), kernel = _e.kernel, ip = _e.ip;
                return {
                    id: rig.id,
                    gpuCoreFrequencies: gpuCoreFrequencies,
                    gpuMemoryFrequencies: gpuMemoryFrequencies,
                    group: rig.group,
                    uptime: uptime,
                    programStartDate: programStartDate,
                    serverTime: serverTime,
                    lastSeenDate: lastSeenDate,
                    totalRestarts: totalRestarts,
                    kernel: kernel,
                    ip: ip,
                    osVersion: rig.version,
                    hashRates: hashRates,
                    hashRate: hashRate,
                    temperatures: temperatures,
                    fansSpeed: fansSpeed,
                };
            });
        }); });
    };
    API.prototype.login = function (email, password) {
        var _this = this;
        return rp({
            method: "POST",
            uri: HOST + "account/login",
            form: {
                "data[User][email]": email,
                "data[User][password]": password,
            },
            followAllRedirects: true,
            jar: this.jar,
            transform: function (body) { return cheerio.load(body); },
        }).then(function ($) {
            var message = $("#content-main-notification").text().trim();
            if (!/Logged success/.test(message)) {
                throw new Error(message);
            }
            return _this.jar;
        });
    };
    API.prototype.getJar = function () {
        if (this.jar.getCookies(HOST).length) {
            return Promise.resolve(this.jar);
        }
        else {
            return this.login(this.email, this.password);
        }
    };
    return API;
}());
exports.default = API;
