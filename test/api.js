"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const fs_1 = require("fs");
const nock = require("nock");
const path_1 = require("path");
const api_1 = require("../lib/api");
const HOST = "https://simplemining.net";
const RIGS_LIST_PAGE = `/json/getListRigs`;
const REBOOT_RIG_PAGE = `/json/rebootRig`;
const COOKIE_PATH = __dirname + "/../tmp/.cookies.json";
// prevent API to really call simplemining
nock(HOST)
    .get(RIGS_LIST_PAGE)
    .reply(200, fs_1.readFileSync(__dirname + "/getListRigs.txt").toString())
    .post(REBOOT_RIG_PAGE)
    .reply(200, fs_1.readFileSync(__dirname + "/rebootRig.txt").toString());
// prevent API to login
const cookieDir = path_1.dirname(COOKIE_PATH);
const cookieStr = `[{"key":"key","value":"value"}]`;
try {
    fs_1.accessSync(cookieDir);
}
catch (e) {
    fs_1.mkdirSync(cookieDir);
}
fs_1.writeFileSync(COOKIE_PATH, cookieStr);
const api = new api_1.default("qwe@qwe.com", "qwe");
describe("getListRigs", () => {
    it("should return 1 IRigInfo", async () => {
        await api.getListRigs().then((rigs) => {
            assert(Array.isArray(rigs));
            assert.equal(rigs.length, 1);
        }, (e) => {
            assert.fail(e.toString());
        });
    });
});
describe("rebootRig", () => {
    it("should return nothing", async () => {
        await api.rebootRig("123456").then((...args) => {
            assert.equal(args.length, 1);
            assert.equal(args[0], undefined);
        }, (e) => {
            assert.fail(e.toString());
        });
    });
});
