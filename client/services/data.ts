import * as fs from "fs";

const axios = require("axios");
const csv=require('csvtojson')
const cron = require('node-cron');



require('dotenv').config()


const GetTime = (time) => {
    return time.slice(0, 2) + ":" + time.slice(2, 4)
}
const GetWildfires =  (): Promise<Fire[]> => {
    return new Promise(async (resolve, reject) => {
        let fire_data =await axios.get(process.env.FIRE_DATA_URL || 'https://firms.modaps.eosdis.nasa.gov/data/active_fire/modis-c6.1/csv/MODIS_C6_1_USA_contiguous_and_Hawaii_7d.csv', {
            responseType: 'stream',
        })
        let fire_data_ca =await axios.get(process.env.FIRE_DATA_URL_CA || 'https://firms.modaps.eosdis.nasa.gov/data/active_fire/modis-c6.1/csv/MODIS_C6_1_Canada_7d.csv', {
            responseType: 'stream',
        })

        let fire_data_wf =await axios.get(process.env.WILDFIRE_DATA_URL || 'https://opendata.arcgis.com/api/v3/datasets/4181a117dc9e43db8598533e29972015_0/downloads/data?format=csv&spatialRefId=4326&where=1%3D1', {
            responseType: 'stream',
        })



        var data = [];
        csv()
            .fromStream(fire_data.data)
            .subscribe((json: any)=> {
                json.date = new Date(`${json.acq_date} ${GetTime(json.acq_time)}`)
                // @ts-ignore
                data.push(json as any)
            }, (e) => reject(e), ()  => {
                csv()
                    .fromStream(fire_data_ca.data)
                    .subscribe((json: any)=> {
                        json.date = new Date(`${json.acq_date} ${GetTime(json.acq_time)}`)
                        // @ts-ignore
                        data.push(json as any)
                    }, () => reject("ERROR"), ()  => {
                        csv()
                            .fromStream(fire_data_wf.data)
                            .subscribe((json: any)=> {
                                json.latitude = json.InitialLatitude;
                                json.longitude = json.InitialLongitude;
                                json.fire = true;
                                json.date = new Date()
                                // @ts-ignore
                                data.push(json as any)
                            }, () => reject("ERROR"), ()  => {
                                fs.writeFileSync('../data.json', JSON.stringify(data as any));
                                resolve(data as any);
                            })
                    })
            })
    })
}



GetWildfires().then((data) =>{
    // initial fetch, then every 1 hrs
    console.log(`Fetched ${data.length} records`)
    cron.schedule('0 0 */12 * * *', function(){
        GetWildfires()
    });
})