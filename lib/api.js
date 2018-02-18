"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var puppeteer_1 = require("puppeteer");
var helper_1 = require("./helper");
var LOGIN_PAGE = "https://simplemining.net/account/login";
var RIGS_LIST_PAGE = "https://simplemining.net/json/getListRigs";
var TESSERACT_JS = "https://cdn.rawgit.com/naptha/tesseract.js/1.0.10/dist/tesseract.js";
var API = /** @class */ (function () {
    function API(email, password) {
        this.email = email;
        this.password = password;
    }
    /**
     * @returns {Promise<void>}
     */
    API.prototype.login = function (closeSession) {
        var _this = this;
        if (closeSession === void 0) { closeSession = true; }
        var closeBrowser = closeSession ? this.closeBrowser : undefined;
        return (new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var _this = this;
            var page_1, retryCount_1, e_1, e_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 8, , 9]);
                        return [4 /*yield*/, this.getBrowser()];
                    case 1: return [4 /*yield*/, (_a.sent()).newPage()];
                    case 2:
                        page_1 = _a.sent();
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 6, , 7]);
                        retryCount_1 = 0;
                        return [4 /*yield*/, page_1.goto(LOGIN_PAGE)];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, this.doLogin(page_1)];
                    case 5:
                        _a.sent();
                        page_1.on("domcontentloaded", function () { return __awaiter(_this, void 0, void 0, function () {
                            var error, e_3;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        _a.trys.push([0, 8, , 9]);
                                        return [4 /*yield*/, page_1.evaluate(function () {
                                                var notif = document.querySelector("#content-main-notification");
                                                return notif ?
                                                    notif.textContent.replace("×", "").trim()
                                                    : (/^You tried to login too many times/.test(document.body.textContent)
                                                        ? document.body.textContent.trim()
                                                        : "");
                                            })];
                                    case 1:
                                        error = _a.sent();
                                        if (!/Logged success/.test(error)) return [3 /*break*/, 3];
                                        return [4 /*yield*/, page_1.close()];
                                    case 2:
                                        _a.sent();
                                        resolve();
                                        return [3 /*break*/, 7];
                                    case 3:
                                        if (!(/Invalid captcha/.test(error) && retryCount_1++ < 3)) return [3 /*break*/, 5];
                                        return [4 /*yield*/, this.doLogin(page_1)];
                                    case 4:
                                        _a.sent();
                                        return [3 /*break*/, 7];
                                    case 5: return [4 /*yield*/, page_1.close()];
                                    case 6:
                                        _a.sent();
                                        reject(new Error(error || "Unknown error"));
                                        _a.label = 7;
                                    case 7: return [3 /*break*/, 9];
                                    case 8:
                                        e_3 = _a.sent();
                                        this.closePageAndReject(page_1, reject, e_3);
                                        return [3 /*break*/, 9];
                                    case 9: return [2 /*return*/];
                                }
                            });
                        }); });
                        return [3 /*break*/, 7];
                    case 6:
                        e_1 = _a.sent();
                        this.closePageAndReject(page_1, reject, e_1);
                        return [3 /*break*/, 7];
                    case 7: return [3 /*break*/, 9];
                    case 8:
                        e_2 = _a.sent();
                        reject(e_2);
                        return [3 /*break*/, 9];
                    case 9: return [2 /*return*/];
                }
            });
        }); })).then(closeBrowser, closeBrowser);
    };
    /**
     * @returns {Promise<IRigInfo[]>}
     */
    API.prototype.getListRigs = function (closeSession) {
        var _this = this;
        if (closeSession === void 0) { closeSession = true; }
        var closeBrowser = closeSession ? function (r) { return _this.closeBrowser().then(function () { return r; }); } : undefined;
        return (new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var _this = this;
            var page_2, tried_1, e_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.getBrowser()];
                    case 1: return [4 /*yield*/, (_a.sent()).newPage()];
                    case 2:
                        page_2 = _a.sent();
                        try {
                            tried_1 = false;
                            page_2.on("response", function (res) { return __awaiter(_this, void 0, void 0, function () {
                                var body, rigs, e_5;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            _a.trys.push([0, 7, , 8]);
                                            return [4 /*yield*/, res.text()];
                                        case 1:
                                            body = _a.sent();
                                            rigs = body ? JSON.parse(body) : null;
                                            if (!rigs) return [3 /*break*/, 2];
                                            resolve(rigs.map(function (rig) {
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
                                            }));
                                            return [3 /*break*/, 6];
                                        case 2:
                                            if (!tried_1) return [3 /*break*/, 3];
                                            reject(new Error("Unable to parse response: " + body));
                                            return [3 /*break*/, 6];
                                        case 3: return [4 /*yield*/, this.login(false)];
                                        case 4:
                                            _a.sent();
                                            return [4 /*yield*/, page_2.reload()];
                                        case 5:
                                            _a.sent();
                                            _a.label = 6;
                                        case 6: return [3 /*break*/, 8];
                                        case 7:
                                            e_5 = _a.sent();
                                            this.closePageAndReject(page_2, reject, e_5);
                                            return [3 /*break*/, 8];
                                        case 8: return [2 /*return*/];
                                    }
                                });
                            }); });
                            page_2.goto(RIGS_LIST_PAGE);
                        }
                        catch (e) {
                            this.closePageAndReject(page_2, reject, e);
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        e_4 = _a.sent();
                        reject(e_4);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); })).then(closeBrowser, closeBrowser);
    };
    /**
     * @param {Page} page
     * @returns {Promise<void>}
     */
    API.prototype.doLogin = function (page) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, page.addScriptTag({ url: TESSERACT_JS })];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, page.evaluate(function (email, password) {
                                var findCaptcha = function () { return document.querySelectorAll("img[src=\"/captcha\"")[0]; };
                                var resolveCaptcha = function (img) {
                                    return Tesseract
                                        .recognize(img, { tessedit_char_whitelist: "abcdefghijklmnopqrstuvwxyz0123456789" })
                                        .progress(console.log);
                                };
                                var login = function (img) {
                                    resolveCaptcha(img).then(function (r) {
                                        document.querySelector("input[name=\"data[User][email]\"]").value = email;
                                        document.querySelector("input[name=\"data[User][password]\"]").value = password;
                                        document.querySelector("input[name=\"data[User][captcha]\"]").value = r.text;
                                        document.querySelector("#login-form [type=\"submit\"]").click();
                                    });
                                };
                                login(findCaptcha());
                            }, this.email, this.password)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * @returns {Promise<Browser>}
     */
    API.prototype.getBrowser = function () {
        var _this = this;
        return this.browser
            ? Promise.resolve(this.browser)
            //*
            : puppeteer_1.launch()
                .then(function (b) { return _this.browser = b; });
    };
    API.prototype.closeBrowser = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getBrowser()];
                    case 1: return [2 /*return*/, (_a.sent()).close()];
                }
            });
        });
    };
    API.prototype.closePageAndReject = function (page, reject, e) {
        var cb = function () {
            reject(e);
        };
        page.close().then(cb, cb);
    };
    return API;
}());
exports.default = API;
