import mongoose from 'mongoose'
mongoose.connect('mongodb://127.0.0.1:27017/firesight');


interface Shelter {
    name: string,
    address: string,
    zip_code: string,
    state: string,
    city: string,
    latitude: string,
    longitude: string
}
const shelters = new mongoose.Schema({
    name: String,
    address: String,
    zip_code: String,
    state: String,
    city: String,
    latitude: String,
    longitude: String
});

export const shelter = mongoose.model<Shelter>('shelter', shelters)