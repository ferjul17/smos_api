"use strict";

import * as cheerio from "cheerio";
import {CookieJar} from "request";
import * as rp from "request-promise-native";
import {parseGPUCoreMemory, parseLastUpdate, parseName, parseSpeed, parseTemps} from "./helper";
import {IGetListRigsRow, IRigInfo} from "./interfaces";

const HOST = "https://simplemining.net/";

export default class API {

    private jar: CookieJar;

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

    private login(email: string, password: string): Promise<CookieJar> {
        return rp({
            method: "POST",
            uri: HOST + "account/login",
            form: {
                "data[User][email]": email,
                "data[User][password]": password,
            },
            followAllRedirects: true,
            jar: this.jar,
            transform: (body) => cheerio.load(body),
        }).then(($) => {
            const message = $("#content-main-notification").text().trim();
            if (!/Logged success/.test(message)) {
                throw new Error(message);
            }
            return this.jar;
        });
    }

    private getJar(): Promise<CookieJar> {
        if (this.jar.getCookies(HOST).length) {
            return Promise.resolve(this.jar);
        } else {
            return this.login(this.email, this.password);
        }
    }
}