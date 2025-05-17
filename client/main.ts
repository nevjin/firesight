import express from 'express';
import cors from 'cors'
import nodeCache from 'node-cache'
import * as fs from "fs";
const cache = new nodeCache();
import moment from 'moment'
import {shelter} from "./mongoose/main";
import {z} from "zod";
import axios from "axios";
const app = express();
app.use(cors())

app.use(express.json())
const isLatitude = num => isFinite(num) && Math.abs(num) <= 90;

const isLongitude = num => isFinite(num) && Math.abs(num) <= 180;

let sheltersObject = z.object({
    address: z.string(),
    city: z.string(),
    name: z.string(),
    state: z.string(),
    zip_code: z.string(),

})

app.post('/api/v1/shelters', async (req: express.Request, res: express.Response) => {
    try {
        let form = await sheltersObject.parseAsync(req.body);



        var data =await axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${form.address} ${form.state} ${form.zip_code}.json?access_token=pk.eyJ1IjoiY29vbHJ1bGVzIiwiYSI6ImNsbW5uZDZhNjBzNnoycnBuZnZsZDNocTUifQ.RI75Yx9uJdNgqSIaHwi41A`)
        if (!data.data.features) {
            return res.sendStatus(400)
        }
        if (data.data.features.length ===0) return res.sendStatus(400)

        let shelter_ = await shelter.create({...form,
        latitude: data.data.features[0].geometry.coordinates[1],
            longitude: data.data.features[0].geometry.coordinates[0]
        });

        console.log(shelter_)
        res.send({center: data.data.features[0].geometry.coordinates})
    }catch (e) {
        if (e instanceof z.ZodError) {
            return res.sendStatus(400)
        }
        res.sendStatus(500);
    }
})
app.get('/api/v1/shelters', async (req: express.Request, res: express.Response) => {
    let sheltersData = await shelter.find();

    res.send(sheltersData)
})

app.get('/api/v1/data', async (req: express.Request, res: express.Response) => {
    var {days} = req.query as any;
    if (!days || !parseInt(days as any)) {
        days = undefined;
    }
    if (!days) {
        days = 1;
    }
    if (cache.get(`data-${days}`)) {
        return res.send(days ? cache.get(`data-${days}`) : cache.get('data'));
    }



    let data: Fire[] = JSON.parse(fs.readFileSync('./data.json').toString('utf-8'))

    var dataSent = data.filter(x => {
        console.log(x.date)
        return moment().diff(moment(x.date), 'hours') <= parseInt(days) * 48
    })

    cache.set(`data-${days}`, dataSent)

    return res.send(dataSent)
})

app.listen(8000, () => {
    console.log('listening')
})