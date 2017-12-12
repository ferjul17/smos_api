"use strict";

import * as cheerio from "cheerio";
import {access, mkdir, readFile, unlink, writeFile} from "fs";
import {dirname} from "path";
import {CookieJar as RequestJar} from "request";
import * as rp from "request-promise-native";
import {Cookie} from "tough-cookie";
import {promisify} from "util";
import {parseGPUCoreMemory, parseLastUpdate, parseName, parseSpeed, parseTemps} from "./helper";
import {IGetListRigsRow, IRigInfo} from "./interfaces";

const HOST = "https://simplemining.net/";
const COOKIE_PATH = __dirname + "/../tmp/.cookies.json";
const readFileAsync = promisify(readFile);
const unlinkAsync = promisify(unlink);
const writeFileAsync = promisify(writeFile);
const mkdirAsync = promisify(mkdir);
const accessAsync = promisify(access);

export default class API {

    private jar: RequestJar;

    private email: string;
    private password: string;

    public constructor(email: string, password: string) {
        this.jar = rp.jar();
        this.email = email;
        this.password = password;
    }

    public getListRigs(): Promise<IRigInfo[]> {
        return this.getJar().then((jar) => rp({
            method: "GET",
            uri: HOST + "json/getListRigs",
            jar,
            transform: (body) => JSON.parse(body),
        }).then((rigs: IGetListRigsRow[]): IRigInfo[] => {
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
        }));
    }

    private login(email: string, password: string): Promise<RequestJar> {
        const jar = rp.jar();
        return rp({
            method: "POST",
            uri: HOST + "account/login",
            form: {
                "data[User][email]": email,
                "data[User][password]": password,
            },
            followAllRedirects: true,
            jar,
            transform: (body) => cheerio.load(body),
        }).then(($) => {
            const message = $("#content-main-notification").text().trim();
            if (!/Logged success/.test(message)) {
                throw new Error(message);
            }
            return jar;
        });
    }

    private getJar(): Promise<RequestJar> {
        if (this.jar.getCookies(HOST).length) {
            return Promise.resolve(this.jar);
        } else {
            const getLoginPromiseFn =
                (): Promise<RequestJar> => this.login(this.email, this.password).then((jar: RequestJar) => {
                    this.jar = jar;
                    const cookieDir = dirname(COOKIE_PATH);
                    const cookieStr = JSON.stringify(jar.getCookies(HOST));
                    const writeJarPromiseFn = () => writeFileAsync(COOKIE_PATH, cookieStr).then(() => jar);
                    const mkdirPromiseFn = () => mkdirAsync(cookieDir).then(writeJarPromiseFn);
                    return accessAsync(cookieDir).then(writeJarPromiseFn, mkdirPromiseFn);
                });
            return readFileAsync(COOKIE_PATH).then((jsonStr: Buffer | string): Promise<RequestJar> => {
                let json;
                try {
                    json = JSON.parse(jsonStr.toString());
                } catch {
                    // Ignore error
                }
                if (!(json instanceof Array)) {
                    return Promise.all([unlinkAsync(COOKIE_PATH), getLoginPromiseFn()])
                        .then(([, theJar]): RequestJar => theJar);
                }
                const jar = rp.jar();
                json.forEach((cookieJSON: object) => {
                    const cookie = Cookie.fromJSON(cookieJSON);
                    if (cookie instanceof Cookie) {
                        // There is an issue in the package @types/request
                        // Cookie from Request IS Cookie from tough-cookie
                        jar.setCookie(cookie, HOST);
                    }
                });
                return Promise.resolve(jar);
            }, getLoginPromiseFn);
        }
    }
}
