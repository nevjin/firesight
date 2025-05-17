"use strict";
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
const main_1 = require("../mongoose/main");
let shelters = [
    {
        name: 'Alarm International Church',
        address: '2532 W Tharpe St',
        zip_code: '32303',
        state: 'FL',
        city: 'Tallahassee',
        latitude: '30.46699',
        longitude: '-84.33447'
    },
    {
        name: 'Forest Capital State Museum Hall',
        address: '204 Forest Park Dr.',
        zip_code: '32348',
        state: 'FL',
        city: 'Perry',
        latitude: '30.08024',
        longitude: '-83.56705'
    },
    {
        name: 'Sabathani Community Center',
        address: '310 East 38th Street',
        zip_code: '55409',
        state: 'MN',
        city: 'Minneapolis',
        latitude: '44.93492',
        longitude: '-93.27168'
    },
    {
        name: 'Trinity Lutheran Church',
        address: '330 S Broadway',
        zip_code: '54303',
        state: 'WI',
        city: 'Green Bay',
        latitude: '44.51344',
        longitude: '-88.02463'
    },
    {
        name: 'The Bin Spot',
        address: '1520 S. Suncoast Blvd.',
        zip_code: '34448',
        state: 'FL',
        city: 'Homosassa',
        latitude: '28.8418',
        longitude: '-82.58279'
    },
    {
        name: 'Chinese Community Center',
        address: '9800 Park Town Drive',
        zip_code: '77036',
        state: 'TX',
        city: 'Houston',
        latitude: '29.71273',
        longitude: '-95.55439'
    },
    {
        name: 'St John the Baptist Catholic Church',
        address: '1476 Oregon Street',
        zip_code: '97465',
        state: 'OR',
        city: 'Port Orford',
        latitude: '42.75005',
        longitude: '-124.49699'
    },
    {
        name: 'Penns Grove Middle School',
        address: '301 S Fifth Street',
        zip_code: '19363',
        state: 'PA',
        city: 'Oxford',
        latitude: '39.77963',
        longitude: '-75.97367'
    },
    {
        name: 'Central Valley High School',
        address: '4066 La Mesa Ave',
        zip_code: '96019',
        state: 'CA',
        city: 'Shasta Lake',
        latitude: '40.67574',
        longitude: '-122.37389'
    }
];
function InitiateData() {
    return __awaiter(this, void 0, void 0, function* () {
        for (var shelter_ of shelters) {
            let find = yield main_1.shelter.findOne({
                latitude: shelter_.latitude,
                longitude: shelter_.longitude
            });
            if (!find) {
                yield main_1.shelter.create(shelter_);
            }
        }
    });
}
InitiateData();
