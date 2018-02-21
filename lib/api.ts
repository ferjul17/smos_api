"use strict";

import {access, mkdir, readFile, writeFile} from "fs";
import {dirname} from "path";
import {Browser, Cookie, launch, Page, Response, SetCookie} from "puppeteer";
import {promisify} from "util";
import {parseGPUCoreMemory, parseLastUpdate, parseName, parseSpeed, parseTemps} from "./helper";
import {IGetListRigsRow, IRigInfo} from "./interfaces";

const COOKIE_PATH = __dirname + "/../tmp/.cookies.json";

const LOGIN_PAGE = "https://simplemining.net/account/login";
const RIGS_LIST_PAGE = "https://simplemining.net/json/getListRigs";
const TESSERACT_JS = "https://cdn.rawgit.com/naptha/tesseract.js/1.0.10/dist/tesseract.js";

const readFileAsync = promisify(readFile);
const writeFileAsync = promisify(writeFile);
const mkdirAsync = promisify(mkdir);
const accessAsync = promisify(access);

export default class API {

    private readonly email: string;
    private readonly password: string;

    private browser: Browser | undefined;

    public constructor(email: string, password: string) {
        this.email = email;
        this.password = password;
    }

    /**
     * @returns {Promise<void>}
     */
    public login(closeSession: boolean = true): Promise<void> {
        const closeBrowser = closeSession ? this.closeBrowser : undefined;
        return (new Promise<void>(async (resolve, reject) => {
            try {
                const page = await this.getPage();
                try {
                    let retryCount = 0;
                    await page.goto(LOGIN_PAGE);
                    await this.doLogin(page);
                    page.on("domcontentloaded", async () => {
                        try {
                            const error = await page.evaluate((): string => {
                                const notif = document.querySelector("#content-main-notification");
                                return notif ?
                                    notif.textContent.replace("×", "").trim()
                                    : (/^You tried to login too many times/.test(document.body.textContent)
                                        ? document.body.textContent.trim()
                                        : "");
                            });
                            if (/Logged success/.test(error)) {
                                await this.saveCookie(page);
                                await page.close();
                                resolve();
                            } else if (/Invalid captcha/.test(error) && retryCount++ < 3) {
                                await this.doLogin(page);
                            } else {
                                await page.close();
                                reject(new Error(error || "Unknown error"));
                            }
                        } catch (e) {
                            this.closePageAndReject(page, reject, e);
                        }
                    });
                } catch (e) {
                    this.closePageAndReject(page, reject, e);
                }
            } catch (e) {
                reject(e);
            }
        })).then(closeBrowser, closeBrowser);

    }

    /**
     * @returns {Promise<IRigInfo[]>}
     */
    public getListRigs(closeSession: boolean = true): Promise<IRigInfo[]> {
        const closeBrowser = closeSession ? (r: IRigInfo[]) => this.closeBrowser().then(() => r) : undefined;
        return (new Promise<IRigInfo[]>(async (resolve, reject) => {
            try {
                const page = await this.getPage();
                try {
                    const tried: boolean = false;
                    page.on("response", async (res: Response) => {
                        try {
                            const body = await res.text();
                            const rigs = body ? JSON.parse(body) as IGetListRigsRow[] : null;
                            if (rigs) {
                                resolve(rigs.map((rig: IGetListRigsRow): IRigInfo => {
                                    const {gpuCoreFrequencies, gpuMemoryFrequencies} = parseGPUCoreMemory(rig);
                                    const {temperatures, fansSpeed} = parseTemps(rig);
                                    const {hashRates, hashRate} = parseSpeed(rig);
                                    const {uptime, programStartDate, serverTime, lastSeenDate, totalRestarts} =
                                        parseLastUpdate(rig);
                                    const {kernel, ip} = parseName(rig);
                                    return {
                                        id: rig.id,
                                        gpuCoreFrequencies,
                                        gpuMemoryFrequencies,
                                        group: rig.group,
                                        uptime,
                                        programStartDate,
                                        serverTime,
                                        lastSeenDate,
                                        totalRestarts,
                                        kernel,
                                        ip,
                                        osVersion: rig.version,
                                        hashRates,
                                        hashRate,
                                        temperatures,
                                        fansSpeed,
                                    };
                                }));
                            } else if (tried) {
                                reject(new Error(`Unable to parse response: ${body}`));
                            } else {
                                await this.login(false);
                                await page.reload();
                            }
                        } catch (e) {
                            this.closePageAndReject(page, reject, e);
                        }
                    });
                    page.goto(RIGS_LIST_PAGE);
                } catch (e) {
                    this.closePageAndReject(page, reject, e);
                }
            } catch (e) {
                reject(e);
            }
        })).then(closeBrowser, closeBrowser);

    }

    /**
     * @param {Page} page
     * @returns {Promise<void>}
     */
    private async doLogin(page: Page) {
        await page.addScriptTag({url: TESSERACT_JS});
        await page.evaluate((email, password) => {
            const findCaptcha = (): Element => document.querySelectorAll("img[src=\"/captcha\"")[0];
            const resolveCaptcha = (img: HTMLImageElement) =>
                Tesseract
                    .recognize(img, {tessedit_char_whitelist: "abcdefghijklmnopqrstuvwxyz0123456789"})
                    .progress(console.log);
            const login = (img: HTMLImageElement) => {
                resolveCaptcha(img).then((r: object) => {
                    document.querySelector("input[name=\"data[User][email]\"]").value = email;
                    document.querySelector("input[name=\"data[User][password]\"]").value = password;
                    document.querySelector("input[name=\"data[User][captcha]\"]").value = r.text;
                    document.querySelector("#login-form [type=\"submit\"]").click();
                });
            };
            login(findCaptcha());
        }, this.email, this.password);
    }

    /**
     * @returns {Promise<Browser>}
     */
    private getBrowser(): Promise<Browser> {
        return this.browser
            ? Promise.resolve(this.browser)
            //*
            : launch()
            /*/
            : launch({headless: false, devtools: true})
            //*/
                .then((b: Browser) => this.browser = b);
    }

    /**
     * @param {Browser} browser
     * @returns {Promise<Page>}
     */
    private getPage(browser?: Browser): Promise<Page> {
        return Promise.all([
            (browser ? Promise.resolve(browser) as Promise<Browser> : this.getBrowser())
                .then((b: Browser) => b.newPage()),
            this.getCookie(),
        ]).then((results: Array<(Page | SetCookie[])>) => {
            const page = results[0] as Page;
            const cookies = results[1] as SetCookie[];
            debugger;
            if (cookies.length) {
                return page.setCookie.apply(page, cookies).then(() => page);
            }
            return page as Page;
        });
    }

    /**
     * @returns {Promise<void>}
     */
    private async closeBrowser(): Promise<void> {
        return (await this.getBrowser()).close();
    }

    /**
     * @param {Page} page
     * @param {(e: Error) => void} reject
     * @param {Error} e
     */
    private closePageAndReject(page: Page, reject: (e: Error) => void, e: Error) {
        const cb = () => {
            reject(e);
        };
        page.close().then(cb, cb);
    }

    /**
     * @param {Page} page
     * @returns {Promise<void>}
     */
    private saveCookie(page: Page): Promise<void> {
        return page.cookies().then((cookies: Cookie[]) => {
            const cookieDir = dirname(COOKIE_PATH);
            const cookieStr = JSON.stringify(cookies);
            const writeJarPromiseFn = () => writeFileAsync(COOKIE_PATH, cookieStr);
            const mkdirPromiseFn = () => mkdirAsync(cookieDir).then(writeJarPromiseFn);
            return accessAsync(cookieDir).then(writeJarPromiseFn, mkdirPromiseFn);
        });
    }

    /**
     * @returns {Promise<SetCookie[]>}
     */
    private getCookie(): Promise<SetCookie[]> {
        return new Promise((resolve) => {
            readFileAsync(COOKIE_PATH).then((str: Buffer | string) => {
                try {
                    resolve(JSON.parse(str.toString()) as SetCookie[]);
                } catch (e) {
                    resolve([]);
                }
            }, () => {
                resolve([]);
            });
        });
    }

}
