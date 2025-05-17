"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const axios = require("axios");
const csv = require('csvtojson');
const cron = require('node-cron');
const stream_1 = require("stream");
const merge = (...streams) => {
    let pass = new stream_1.PassThrough();
    for (let stream of streams) {
        const end = stream == streams.at(-1);
        pass = stream.pipe(pass, { end });
    }
    return pass;
};
require('dotenv').config();
const GetTime = (time) => {
    return time.slice(0, 2) + ":" + time.slice(2, 4);
};
const GetWildfires = () => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        let fire_data = yield axios.get(process.env.FIRE_DATA_URL || 'https://firms.modaps.eosdis.nasa.gov/data/active_fire/modis-c6.1/csv/MODIS_C6_1_USA_contiguous_and_Hawaii_7d.csv', {
            responseType: 'stream',
        });
        let fire_data_ca = yield axios.get(process.env.FIRE_DATA_URL_CA || 'https://firms.modaps.eosdis.nasa.gov/data/active_fire/modis-c6.1/csv/MODIS_C6_1_Canada_7d.csv', {
            responseType: 'stream',
        });
        let fire_data_wf = yield axios.get(process.env.WILDFIRE_DATA_URL || 'https://opendata.arcgis.com/api/v3/datasets/4181a117dc9e43db8598533e29972015_0/downloads/data?format=csv&spatialRefId=4326&where=1%3D1', {
            responseType: 'stream',
        });
        var data = [];
        csv()
            .fromStream(fire_data.data)
            .subscribe((json) => {
            json.date = new Date(`${json.acq_date} ${GetTime(json.acq_time)}`);
            // @ts-ignore
            data.push(json);
        }, (e) => reject(e), () => {
            csv()
                .fromStream(fire_data_ca.data)
                .subscribe((json) => {
                json.date = new Date(`${json.acq_date} ${GetTime(json.acq_time)}`);
                // @ts-ignore
                data.push(json);
            }, () => reject("ERROR"), () => {
                csv()
                    .fromStream(fire_data_wf.data)
                    .subscribe((json) => {
                    json.latitude = json.InitialLatitude;
                    json.longitude = json.InitialLongitude;
                    json.fire = true;
                    json.date = new Date();
                    // @ts-ignore
                    data.push(json);
                }, () => reject("ERROR"), () => {
                    fs.writeFileSync('../data.json', JSON.stringify(data));
                    resolve(data);
                });
            });
        });
    }));
};
GetWildfires().then((data) => {
    // initial fetch, then every 1 hrs
    console.log(`Fetched ${data.length} records`);
    cron.schedule('0 0 */12 * * *', function () {
        GetWildfires();
    });
});
