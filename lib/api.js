"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var cheerio = require("cheerio");
var fs_1 = require("fs");
var path_1 = require("path");
var rp = require("request-promise-native");
var tough_cookie_1 = require("tough-cookie");
var util_1 = require("util");
var helper_1 = require("./helper");
var HOST = "https://simplemining.net/";
var COOKIE_PATH = __dirname + "/../tmp/.cookies.json";
var readFileAsync = util_1.promisify(fs_1.readFile);
var unlinkAsync = util_1.promisify(fs_1.unlink);
var writeFileAsync = util_1.promisify(fs_1.writeFile);
var mkdirAsync = util_1.promisify(fs_1.mkdir);
var accessAsync = util_1.promisify(fs_1.access);
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
        var jar = rp.jar();
        return rp({
            method: "POST",
            uri: HOST + "account/login",
            form: {
                "data[User][email]": email,
                "data[User][password]": password,
            },
            followAllRedirects: true,
            jar: jar,
            transform: function (body) { return cheerio.load(body); },
        }).then(function ($) {
            var message = $("#content-main-notification").text().trim();
            if (!/Logged success/.test(message)) {
                throw new Error(message);
            }
            return jar;
        });
    };
    API.prototype.getJar = function () {
        var _this = this;
        if (this.jar.getCookies(HOST).length) {
            return Promise.resolve(this.jar);
        }
        else {
            var getLoginPromiseFn_1 = function () { return _this.login(_this.email, _this.password).then(function (jar) {
                _this.jar = jar;
                var cookieDir = path_1.dirname(COOKIE_PATH);
                var cookieStr = JSON.stringify(jar.getCookies(HOST));
                var writeJarPromiseFn = function () { return writeFileAsync(COOKIE_PATH, cookieStr).then(function () { return jar; }); };
                var mkdirPromiseFn = function () { return mkdirAsync(cookieDir).then(writeJarPromiseFn); };
                return accessAsync(cookieDir).then(writeJarPromiseFn, mkdirPromiseFn);
            }); };
            return readFileAsync(COOKIE_PATH).then(function (jsonStr) {
                var json;
                try {
                    json = JSON.parse(jsonStr.toString());
                }
                catch (_a) {
                    // Ignore error
                }
                if (!(json instanceof Array)) {
                    return Promise.all([unlinkAsync(COOKIE_PATH), getLoginPromiseFn_1()])
                        .then(function (_a) {
                        var theJar = _a[1];
                        return theJar;
                    });
                }
                var jar = rp.jar();
                json.forEach(function (cookieJSON) {
                    var cookie = tough_cookie_1.Cookie.fromJSON(cookieJSON);
                    if (cookie instanceof tough_cookie_1.Cookie) {
                        // There is an issue in the package @types/request
                        // Cookie from Request IS Cookie from tough-cookie
                        jar.setCookie(cookie, HOST);
                    }
                });
                return Promise.resolve(jar);
            }, getLoginPromiseFn_1);
        }
    };
    return API;
}());
exports.default = API;
