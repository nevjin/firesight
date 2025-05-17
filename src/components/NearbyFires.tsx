import Cookie from 'js-cookie'
import React from "react";
function distance(lat1, lon1, lat2, lon2, unit) {
    var radlat1 = Math.PI * lat1/180
    var radlat2 = Math.PI * lat2/180
    var theta = lon1-lon2
    var radtheta = Math.PI * theta/180
    var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    if (dist > 1) {
        dist = 1;
    }
    dist = Math.acos(dist)
    dist = dist * 180/Math.PI
    dist = dist * 60 * 1.1515
    if (unit=="K") { dist = dist * 1.609344 }
    if (unit=="N") { dist = dist * 0.8684 }
    return dist
}
export default function NearbyFires({data, shelters, setNearShelters, setFiresModal}: any) {
    React.useEffect(()=> {
        if (!data ||!shelters)return;
        if (!Cookie.get('wildfires_near')) {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(successFunction, errorFunction);
            } else {
                console.debug("Geolocation is not supported by this browser.");
            }

            function successFunction(position) {
                let nearFires =  data.map(x => {
                    x.distance = distance(x.latitude, x.longitude, position.coords.latitude, position.coords.longitude, 'K')
                    return x;
                }).filter(x => x.distance < 20)

                if (nearFires.length > 0) {
                    setNearFires(nearFires)
                    setNearShelters( data.map(x => {
                        x.distance = distance(x.latitude, x.longitude, position.coords.latitude, position.coords.longitude, 'K')
                        return x;
                    }).filter(x => x.distance < 20))
                    setFiresModal(true)
                } else {

                }
            }

            function errorFunction() {
                console.debug("Unable to retrieve your location.");
            }
        }
    }, [data, shelters])

    return <>
    </>
}