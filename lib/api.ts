"use strict";

import {Browser, launch, Page, Response} from "puppeteer";
import {parseGPUCoreMemory, parseLastUpdate, parseName, parseSpeed, parseTemps} from "./helper";
import {IGetListRigsRow, IRigInfo} from "./interfaces";

const LOGIN_PAGE = "https://simplemining.net/account/login";
const RIGS_LIST_PAGE = "https://simplemining.net/json/getListRigs";
const TESSERACT_JS = "https://cdn.rawgit.com/naptha/tesseract.js/1.0.10/dist/tesseract.js";

export default class API {

    private readonly email: string;
    private readonly password: string;

    private browser: Browser;

    public constructor(email: string, password: string) {
        this.email = email;
        this.password = password;
    }

    /**
     * @returns {Promise<void>}
     */
    public login(): Promise<void> {
        return new Promise<void>(async (resolve, reject) => {
            try {
                const page = await (await this.getBrowser()).newPage();
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
        });

    }

    /**
     * @returns {Promise<IRigInfo[]>}
     */
    public getListRigs(): Promise<IRigInfo[]> {

        return new Promise<IRigInfo[]>(async (resolve, reject) => {
            try {
                const page = await (await this.getBrowser()).newPage();
                try {
                    const tried: boolean = false;
                    page.on("response", async (res: Response) => {
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
                            await this.login();
                            await page.reload();
                        }
                    });
                    page.goto(RIGS_LIST_PAGE);
                } catch (e) {
                    this.closePageAndReject(page, reject, e);
                }
            } catch (e) {
                reject(e);
            }
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

    private closePageAndReject(page: Page, reject: (e: Error) => void, e: Error) {
        page.close().catch(() => {
            reject(e);
        }).then(() => {
            reject(e);
        });
    }

}
