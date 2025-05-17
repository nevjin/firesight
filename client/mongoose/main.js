"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.shelter = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
mongoose_1.default.connect('mongodb://127.0.0.1:27017/firesight');
const shelters = new mongoose_1.default.Schema({
    name: String,
    address: String,
    zip_code: String,
    state: String,
    city: String,
    latitude: String,
    longitude: String
});
exports.shelter = mongoose_1.default.model('shelter', shelters);
