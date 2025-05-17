import * as React from 'react';
import { useState, useMemo, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import Map, { Marker, Popup, NavigationControl, FullscreenControl, ScaleControl, GeolocateControl, useMap, Layer, Source, } from 'react-map-gl';
import useSWR from "swr";
import './index.css';
import { House, HouseLine, Info, MagnifyingGlass } from "phosphor-react";
import AddShelterModal from "./components/AddShelterModal";
import axios from "axios";
import Cookie from 'js-cookie';
import NearFires from './components/NearFires';
import Disclaimer from './components/Disclaimer';
import SearchModal from './components/SearchModal';
const TOKEN = 'pk.eyJ1IjoiZmFrZXVzZXJnaXRodWIiLCJhIjoiY2pwOGlneGI4MDNnaDN1c2J0eW5zb2ZiNyJ9.mALv0tCpbYUPtzT7YysA2g'; // Set your mapbox token here
const fetcher = url => fetch(url).then(r => r.json());
function distance(lat1, lon1, lat2, lon2, unit) {
    var radlat1 = Math.PI * lat1 / 180;
    var radlat2 = Math.PI * lat2 / 180;
    var theta = lon1 - lon2;
    var radtheta = Math.PI * theta / 180;
    var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    if (dist > 1) {
        dist = 1;
    }
    dist = Math.acos(dist);
    dist = dist * 180 / Math.PI;
    dist = dist * 60 * 1.1515;
    if (unit == "K") {
        dist = dist * 1.609344;
    }
    if (unit == "N") {
        dist = dist * 0.8684;
    }
    return dist;
}
function ControlPanel() {
    const [search, setSearch] = React.useState(false);
    const [text, setText] = React.useState();
    const [addShelter, setAddShelter] = React.useState(false);
    const { current: map } = useMap();
    const searchOnEnter = async (event) => {
        if (event.key === "Enter") {
            var data = await axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${text}.json?access_token=pk.eyJ1IjoiZmFrZXVzZXJnaXRodWIiLCJhIjoiY2pwOGlneGI4MDNnaDN1c2J0eW5zb2ZiNyJ9.mALv0tCpbYUPtzT7YysA2g`);
            map.flyTo({ center: data.data.features[0].center, zoom: 9 });
            setSearch(false);
            setText();
        }
    };
    React.useEffect(() => {
        map.loadImage('/firered.png', (error, image) => {
            map.addImage('fire', image);
            if (error)
                throw error;
        });
    }, []);
    return (React.createElement(React.Fragment, null,
        React.createElement(AddShelterModal, { open: addShelter, setOpen: setAddShelter }),
        React.createElement(SearchModal, { setText: setText, text: text, searchOnEnter: searchOnEnter, open: search, setOpen: setSearch }),
        React.createElement("div", { className: '' }),
        React.createElement("img", { src: '/logo.svg', className: 'left-[50px] top-0 absolute w-48' }),
        React.createElement("div", { className: "control-panel  rounded-md absolute right-0 top-0 m-[20px]" },
            React.createElement("div", { className: 'flex items-center gap-4' },
                React.createElement("div", { onClick: () => setSearch(true), className: 'w-full h-full flex items-center gap-4 p-2 rounded-md w-9 h-9 bg-white shadow-md hover:cursor-pointer' },
                    React.createElement(MagnifyingGlass, { weight: 'duotone', size: 23 })),
                React.createElement("div", { onClick: () => setAddShelter(true), className: 'w-full h-full flex items-center gap-4 p-2 rounded-md w-9 h-9 bg-white shadow-md hover:cursor-pointer' },
                    React.createElement(HouseLine, { weight: 'duotone', size: 23 }))))));
}
const ZoomBtn = ({ popUpInfo, close }) => {
    const { current: map } = useMap();
    return React.createElement("div", { onClick: () => {
            map.flyTo({ center: [popUpInfo.longitude, popUpInfo.latitude], zoom: 15 });
            close();
        }, className: 'flex items-center gap-3 bg-blue-700 shadow-lg hover:cursor-pointer w-full h-[25px] mt-3 font-medium text-white justify-center rounded-md' },
        React.createElement(MagnifyingGlass, { weight: 'duotone' }),
        " Zoom");
};
const layerStyle = {
    id: 'anomaly',
    type: 'circle',
    paint: {
        'circle-radius': 5,
        'circle-color': '#d95722'
    }
};
const layerStyleFire = {
    id: 'fire',
    'type': 'symbol',
    filter: ['!', ['has', 'point_count']],
    layout: {
        'icon-image': 'fire',
        'icon-size': 0.1
    }
};
export default function App() {
    const [popupInfo, setPopupInfo] = useState(null);
    const [shelterModal, setShelterModal] = React.useState(false);
    const [nearFires, setNearFires] = React.useState([]);
    const [nearShelters, setNearShelters] = React.useState([]);
    const [disclaimer, setDisclaimer] = React.useState(false);
    const [firesModal, setFiresModal] = React.useState(null);
    const { data } = useSWR('http://localhost:8000/api/v1/data', fetcher);
    const { data: shelters } = useSWR("http://localhost:8000/api/v1/shelters", fetcher);
    const onHover = useCallback(event => {
        if (!event?.features?.length)
            return;
        setPopupInfo({ ...event.features[0].properties });
    }, []);
    const sheltersRender = useMemo(() => {
        let sheltersd = shelters ? shelters : [];
        return sheltersd.map((city, index) => (React.createElement(Marker, { key: `marker-${index}`, longitude: city.longitude, latitude: city.latitude, anchor: "bottom", onClick: e => {
                // If we let the click event propagates to the map, it will immediatelny close the popup
                // with `closeOnClick: true`
                e.originalEvent.stopPropagation();
                city.shelter = true;
                setPopupInfo(city);
            } },
            React.createElement(House, { weight: 'duotone', className: 'text-blue-500', size: 20 }))));
    }, [shelters]);
    const geojsonFires = {
        type: 'FeatureCollection',
        features: data ? data.filter(x => x.fire).map(dx => {
            return {
                "geometry": {
                    "type": "Point",
                    "coordinates": [parseFloat(dx.longitude), parseFloat(dx.latitude)]
                },
                type: "Feature",
                properties: {
                    ...dx
                }
            };
        }) : []
    };
    const geojson = {
        type: 'FeatureCollection',
        features: data ? data.filter(x => !x.fire).map(dx => {
            return {
                "geometry": {
                    "type": "Point",
                    "coordinates": [parseFloat(dx.longitude), parseFloat(dx.latitude)]
                },
                type: "Feature",
                properties: {
                    ...dx
                }
            };
        }) : []
    };
    React.useEffect(() => {
        if (!data || !shelters)
            return;
        if (!Cookie.get('wildfires_near')) {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(successFunction, errorFunction);
            }
            else {
                console.debug("Geolocation is not supported by this browser.");
            }
            function successFunction(position) {
                let nearFires = data.map(x => {
                    x.distance = distance(x.latitude, x.longitude, position.coords.latitude, position.coords.longitude, 'K');
                    return x;
                }).filter(x => x.distance < 300);
                if (nearFires.length > 0) {
                    setNearFires(nearFires);
                    setNearShelters(data.map(x => {
                        x.distance = distance(x.latitude, x.longitude, position.coords.latitude, position.coords.longitude, 'K');
                        return x;
                    }).filter(x => x.distance < 300));
                    setFiresModal(true);
                }
                else {
                }
            }
            function errorFunction() {
                console.debug("Unable to retrieve your location.");
            }
        }
    }, [data, shelters]);
    if (!data) {
        return;
    }
    return (React.createElement(React.Fragment, null,
        React.createElement(Map, { initialViewState: {
                latitude: 40,
                longitude: -100,
                zoom: 3.5,
                bearing: 0,
                pitch: 0
            }, onClick: onHover, interactiveLayerIds: ['fire', 'anomaly'], mapStyle: "mapbox://styles/mapbox/dark-v9?optimize=true", mapboxAccessToken: TOKEN },
            React.createElement(GeolocateControl, { position: "top-left" }),
            React.createElement(FullscreenControl, { position: "top-left" }),
            React.createElement(NavigationControl, { position: "top-left" }),
            React.createElement(ScaleControl, null),
            React.createElement(Source, { id: "fires", type: "geojson", data: geojsonFires, clusterRadius: 10 },
                React.createElement(Layer, { ...layerStyleFire })),
            React.createElement(Source, { id: "anomalies", type: "geojson", data: geojson },
                React.createElement(Layer, { ...layerStyle })),
            sheltersRender,
            console.log('popup info: ', popupInfo),
            popupInfo && (React.createElement(Popup, { anchor: "top-left", offset: [0, 0], longitude: Number(popupInfo.longitude), latitude: Number(popupInfo.latitude), key: Number(popupInfo.longitude) + Number(popupInfo.latitude), onClose: () => setPopupInfo(null) },
                React.createElement("div", { className: 'text-white text-[15px]  mb-3 font-medium' }, popupInfo.shelter ? 'Emergency Shelter' : popupInfo.fire ? 'Fire' : 'Satellite Fire Anomaly'),
                popupInfo.shelter && React.createElement(React.Fragment, null,
                    React.createElement("div", { className: 'flex items-center gap-2 text-white' },
                        React.createElement("div", { className: 'bg-[#244153] flex-1 p-1 pl-2 box-border rounded-sm' }, "Name"),
                        React.createElement("div", { className: 'bg-[#244153] flex-1 p-1 pl-2 box-border rounded-sm truncate' }, popupInfo.name)),
                    React.createElement("div", { className: 'flex items-center gap-2 text-white mt-2' },
                        React.createElement("div", { className: 'bg-[#244153] flex-1 p-1 pl-2 box-border rounded-sm' }, "Address"),
                        React.createElement("div", { className: 'bg-[#244153] flex-1 p-1 pl-2 box-border rounded-sm truncate' }, popupInfo.address))),
                popupInfo.fire && !popupInfo.shelter && React.createElement(React.Fragment, null,
                    React.createElement("div", { className: 'flex items-center gap-2 text-white' },
                        React.createElement("div", { className: 'bg-[#244153] flex-1 p-1 pl-2 box-border rounded-sm' }, "Fire ID"),
                        React.createElement("div", { className: 'bg-[#244153] flex-1 p-1 pl-2 box-border rounded-sm truncate' }, popupInfo.UniqueFireIdentifier)),
                    React.createElement("div", { className: 'flex items-center gap-2 text-white mt-2' },
                        React.createElement("div", { className: 'bg-[#244153] flex-1 p-1 pl-2 box-border rounded-sm' }, "Incident MGMT Org"),
                        React.createElement("div", { className: 'bg-[#244153] flex-1 p-1 pl-2 box-border rounded-sm truncate' }, popupInfo.IncidentManagementOrganization ? popupInfo.IncidentManagementOrganization : 'Unknown')),
                    React.createElement("div", { className: 'flex items-center gap-2 text-white mt-2' },
                        React.createElement("div", { className: 'bg-[#244153] flex-1 p-1 pl-2 box-border rounded-sm' }, "% Contained"),
                        React.createElement("div", { className: 'bg-[#244153] flex-1 p-1 pl-2 box-border rounded-sm truncate' },
                            popupInfo.PercentContained ? popupInfo.PercentContained : 0,
                            "%")),
                    React.createElement("div", { className: 'flex items-center gap-2 mt-2 text-white' },
                        React.createElement("div", { className: 'bg-[#244153] flex-1 p-1 pl-2 box-border rounded-sm' }, "Irwin ID"),
                        React.createElement("div", { className: 'bg-[#244153] flex-1 p-1 pl-2 box-border rounded-sm truncate' }, popupInfo.IrwinID))),
                !popupInfo.fire && !popupInfo.shelter && React.createElement(React.Fragment, null,
                    React.createElement("div", { className: 'flex items-center gap-2 text-white' },
                        React.createElement("div", { className: 'bg-[#244153] flex-1 p-1 pl-2 box-border rounded-sm' }, "Confidence"),
                        React.createElement("div", { className: 'bg-[#244153] flex-1 p-1 pl-2 box-border rounded-sm' }, popupInfo.confidence)),
                    React.createElement("div", { className: 'flex items-center gap-2 mt-2 text-white' },
                        React.createElement("div", { className: 'bg-[#244153] flex-1 p-1 pl-2 box-border rounded-sm' }, "Version"),
                        React.createElement("div", { className: 'bg-[#244153] flex-1 p-1 pl-2 box-border rounded-sm' }, popupInfo.version))),
                React.createElement(ZoomBtn, { close: () => {
                        setPopupInfo(null);
                    }, popUpInfo: popupInfo }))),
            React.createElement(NearFires, { data: nearFires, shelters: shelters, open: firesModal, setOpen: setFiresModal }),
            React.createElement(Disclaimer, { open: disclaimer, setOpen: setDisclaimer }),
            React.createElement(ControlPanel, null),
            React.createElement("div", { className: 'absolute right-3 bottom-10' },
                React.createElement("div", { onClick: () => setDisclaimer(true), className: 'flex items-center hover:cursor-pointer gap-3 p-2 text-[15px] rounded-md font-medium  bg-orange-500  bg-opacity-40' },
                    React.createElement(Info, { className: 'text-orange-500', size: 20 }),
                    " ",
                    React.createElement("h1", null, "Disclaimer regarding fires"))))));
}
export function renderToDom(container) {
    createRoot(container).render(React.createElement(App, null));
}
//# sourceMappingURL=app.js.map