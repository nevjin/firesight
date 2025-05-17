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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const node_cache_1 = __importDefault(require("node-cache"));
const fs = __importStar(require("fs"));
const cache = new node_cache_1.default();
const moment_1 = __importDefault(require("moment"));
const main_1 = require("./mongoose/main");
const zod_1 = require("zod");
const axios_1 = __importDefault(require("axios"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const isLatitude = num => isFinite(num) && Math.abs(num) <= 90;
const isLongitude = num => isFinite(num) && Math.abs(num) <= 180;
let sheltersObject = zod_1.z.object({
    address: zod_1.z.string(),
    city: zod_1.z.string(),
    name: zod_1.z.string(),
    state: zod_1.z.string(),
    zip_code: zod_1.z.string(),
});
app.post('/api/v1/shelters', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let form = yield sheltersObject.parseAsync(req.body);
        var data = yield axios_1.default.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${form.address} ${form.state} ${form.zip_code}.json?access_token=pk.eyJ1IjoiY29vbHJ1bGVzIiwiYSI6ImNsbW5uZDZhNjBzNnoycnBuZnZsZDNocTUifQ.RI75Yx9uJdNgqSIaHwi41A`);
        if (!data.data.features) {
            return res.sendStatus(400);
        }
        if (data.data.features.length === 0)
            return res.sendStatus(400);
        let shelter_ = yield main_1.shelter.create(Object.assign(Object.assign({}, form), { latitude: data.data.features[0].geometry.coordinates[1], longitude: data.data.features[0].geometry.coordinates[0] }));
        console.log(shelter_);
        res.send({ center: data.data.features[0].geometry.coordinates });
    }
    catch (e) {
        if (e instanceof zod_1.z.ZodError) {
            return res.sendStatus(400);
        }
        res.sendStatus(500);
    }
}));
app.get('/api/v1/shelters', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let sheltersData = yield main_1.shelter.find();
    res.send(sheltersData);
}));
app.get('/api/v1/data', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var { days } = req.query;
    if (!days || !parseInt(days)) {
        days = undefined;
    }
    if (!days) {
        days = 1;
    }
    if (cache.get(`data-${days}`)) {
        return res.send(days ? cache.get(`data-${days}`) : cache.get('data'));
    }
    let data = JSON.parse(fs.readFileSync('./data.json').toString('utf-8'));
    var dataSent = data.filter(x => {
        console.log(x.date);
        return (0, moment_1.default)().diff((0, moment_1.default)(x.date), 'hours') <= parseInt(days) * 48;
    });
    console.log('data: ', dataSent, days);
    cache.set(`data-${days}`, dataSent);
    return res.send(dataSent);
}));
app.listen(8000, () => {
    console.log('listening');
});
