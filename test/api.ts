import * as assert from "assert";
import {accessSync, mkdirSync, readFileSync, writeFileSync} from "fs";
import * as nock from "nock";
import {dirname} from "path";
import {default as API} from "../lib/api";
import {IRigInfo} from "../lib/interfaces";

const HOST = "https://simplemining.net";
const RIGS_LIST_PAGE = `/json/getListRigs`;

const COOKIE_PATH = __dirname + "/../tmp/.cookies.json";

// prevent API to really call simplemining
nock(HOST)
    .get(RIGS_LIST_PAGE)
    .reply(200, readFileSync(__dirname + "/getListRigs.txt").toString());

// prevent API to login
const cookieDir = dirname(COOKIE_PATH);
const cookieStr = `[{"key":"key","value":"value"}]`;
try {
    accessSync(cookieDir);
} catch (e) {
    mkdirSync(cookieDir);
}
writeFileSync(COOKIE_PATH, cookieStr);

const api = new API("qwe@qwe.com", "qwe");
describe("getListRigs", () => {
    it("should return 1 IRigInfo", async () => {
        await api.getListRigs().then((rigs: IRigInfo[]) => {
            assert(Array.isArray(rigs));
            assert.equal(rigs.length, 1);
        }, (e: any) => {
            assert.fail(e.toString());
        });
    });
});
