"use strict";

import {access, mkdir, readFile, unlink, writeFile} from "fs";
import {dirname} from "path";
import {Browser, Cookie, launch, Page} from "puppeteer";
import {CookieJar} from "request";
import * as rp from "request-promise-native";
import {RequestPromise} from "request-promise-native";
import * as ToughCookie from "tough-cookie";
import {promisify} from "util";
import {parseGPUCoreMemory, parseLastUpdate, parseName, parseSpeed, parseTemps} from "./helper";
import {IGetListRigsRow, IRigInfo} from "./interfaces";

const COOKIE_PATH = __dirname + "/../tmp/.cookies.json";

const HOST = "https://simplemining.net/";
const LOGIN_PAGE = `${HOST}account/login`;
const RIGS_LIST_PAGE = `${HOST}json/getListRigs`;

const TESSERACT_JS = "https://cdn.rawgit.com/naptha/tesseract.js/1.0.10/dist/tesseract.js";

const accessAsync = promisify(access);
const mkdirAsync = promisify(mkdir);
const readFileAsync = promisify(readFile);
const unlinkAsync = promisify(unlink);
const writeFileAsync = promisify(writeFile);

export default class API {

    private readonly email: string;
    private readonly password: string;

    private jar: CookieJar | undefined;
    private browser: Browser | undefined;

    public constructor(email: string, password: string) {
        this.email = email;
        this.password = password;
    }

    /**
     * @returns {Promise<IRigInfo[]>}
     */
    public getListRigs(): Promise<IRigInfo[]> {

        let retryCount = 0;
        const callListRigs = (): Promise<IGetListRigsRow[]> =>
            this.getJar().then((jar: CookieJar): RequestPromise => rp({
                method: "GET",
                uri: RIGS_LIST_PAGE,
                jar,
            })).then((body: string) => body === ""
                ? this.deleteSavedCookies().then(() => retryCount++ === 3
                    ? Promise.reject(new Error("Unable to get rigs list"))
                    : callListRigs())
                : JSON.parse(body));

        return callListRigs().then((rigs: IGetListRigsRow[]): IRigInfo[] => {
            return rigs.map((rig: IGetListRigsRow): IRigInfo => {
                const {gpuCoreFrequencies, gpuMemoryFrequencies} = parseGPUCoreMemory(rig);
                const {temperatures, fansSpeed} = parseTemps(rig);
                const {hashRates, hashRate} = parseSpeed(rig);
                const {uptime, programStartDate, serverTime, lastSeenDate, totalRestarts} = parseLastUpdate(rig);
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
            });
        });
    }

    /**
     * @returns {Promise<void>}
     */
    private login(): Promise<CookieJar> {
        return new Promise<CookieJar>((resolve, reject) => {
            const closeBrowser = (): Promise<void> => this.getBrowser()
                .then((browser: Browser) => browser.close()
                    .then(() => this.browser = undefined, () => this.browser = undefined));
            const rejecter = ((e: Error) => {
                closeBrowser();
                reject(e);
            });
            this.getPage().then((page: Page) => {
                let retryCount = 0;
                return page.goto(LOGIN_PAGE).then(() => {
                    return this.doLogin(page);
                }).then(() => {
                    page.on("domcontentloaded", () => {
                        page.evaluate((): string => {
                            const notif = document.querySelector("#content-main-notification");
                            return notif && notif.textContent
                                ? notif.textContent.replace("×", "").trim()
                                : (document.body && document.body.textContent &&
                                    /^You tried to login too many times/.test(document.body.textContent)
                                        ? document.body.textContent.trim()
                                        : ""
                                );
                        }).then((error) => {
                            if (/Logged success/.test(error)) {
                                page.cookies()
                                    .then((cookies: Cookie[]) => this.convertPuppeteerCookiesToToughCookies(cookies))
                                    .then((cookies: ToughCookie.Cookie[]) =>
                                        Promise.all([this.saveCookie(cookies), closeBrowser()]).then(() => cookies))
                                    .then((cookies: ToughCookie.Cookie[]) => {
                                        this.jar = rp.jar();
                                        cookies.forEach((cookie: ToughCookie.Cookie) => {
                                            this.jar.setCookie(cookie, HOST);
                                        });
                                        resolve(this.jar);
                                    });
                            } else if (/Invalid captcha/.test(error) && retryCount++ < 3) {
                                this.doLogin(page).catch(rejecter);
                            } else {
                                rejecter(new Error(error || "Unknown error"));
                            }
                        }).catch(rejecter);
                    });
                });
            }).catch(rejecter);
        });
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
     * @returns {Promise<Page>}
     */
    private getPage(): Promise<Page> {
        return this.getBrowser().then((browser: Browser): Promise<Page> => browser.newPage());
    }

    /**
     * @param {Cookie[]} cookies
     * @returns {Promise<void>}
     */
    private saveCookie(cookies: ToughCookie.Cookie[]): Promise<void> {
        const cookieDir = dirname(COOKIE_PATH);
        const cookieStr = JSON.stringify(cookies);
        const writeJarPromiseFn = () => writeFileAsync(COOKIE_PATH, cookieStr);
        const mkdirPromiseFn = () => mkdirAsync(cookieDir).then(writeJarPromiseFn);
        return accessAsync(cookieDir).then(writeJarPromiseFn, mkdirPromiseFn);
    }

    /**
     * @param {Cookie[]} cookies
     * @returns {ToughCookie.Cookie[]}
     */
    private convertPuppeteerCookiesToToughCookies(cookies: Cookie[]): ToughCookie.Cookie[] {
        return cookies.map((cookie: Cookie): ToughCookie.Cookie => new ToughCookie.Cookie({
                key: cookie.name,
                value: cookie.value,
                expires: new Date(cookie.expires * 1000),
                domain: cookie.domain,
                path: cookie.path,
                secure: cookie.secure,
                httpOnly: cookie.httpOnly,
            }),
        );
    }

    /**
     * @returns {Promise<void>}
     */
    private deleteSavedCookies(): Promise<void> {
        delete this.jar;
        return unlinkAsync(COOKIE_PATH);
    }

    /**
     * @returns {Promise<request.CookieJar>}
     */
    private getJar(): Promise<CookieJar> {
        if (this.jar && this.jar.getCookies(HOST).length) {
            return Promise.resolve(this.jar);
        } else {
            return readFileAsync(COOKIE_PATH).then((jsonStr: Buffer | string): Promise<CookieJar> => {
                let json;
                try {
                    json = JSON.parse(jsonStr.toString());
                } catch {
                    // Ignore error
                }
                if (!(json instanceof Array)) {
                    return Promise.all([this.deleteSavedCookies(), this.login()])
                        .then(([, theJar]): CookieJar => theJar);
                }
                const jar = rp.jar();
                json.forEach((cookieJSON: object) => {
                    const cookie = ToughCookie.Cookie.fromJSON(cookieJSON);
                    if (cookie instanceof ToughCookie.Cookie) {
                        jar.setCookie(cookie, HOST);
                    }
                });
                this.jar = jar;
                return Promise.resolve(this.jar);
            }, this.login.bind(this));
        }
    }

}
