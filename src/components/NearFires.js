import React from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useSWRConfig } from "swr";
import { Compass } from "phosphor-react";
import { useMap } from "react-map-gl";
import Cookie from 'js-cookie';
export default function NearFires({ open, setOpen, data, shelters }) {
    const { register, handleSubmit } = useForm();
    const { mutate } = useSWRConfig();
    const [post, setPost] = React.useState(false);
    const [fires, setFires] = React.useState([]);
    const { current: map } = useMap();
    const onClose = () => {
        Cookie.set('wildfires_near', 'seen');
        setOpen(false);
    };
    const onSubmit = (data) => {
        setPost(true);
        data.latitude = parseFloat(data.latitude);
        data.longitude = parseFloat(data.longitude);
        axios.post('https://api.imfate.xyz/api/v1/shelters', data).then(data => {
            mutate('https://api.imfate.xyz/api/v1/shelters');
            setPost(false);
            setOpen(false);
        });
    };
    const handleLoc = async () => {
        var locations = data.slice(0, 4);
        for (var location of locations) {
            var reversegeo = await axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${location.longitude},${location.latitude}.json?access_token=pk.eyJ1IjoiZmFrZXVzZXJnaXRodWIiLCJhIjoiY2pwOGlneGI4MDNnaDN1c2J0eW5zb2ZiNyJ9.mALv0tCpbYUPtzT7YysA2g`);
            location.location = reversegeo.data.features[0].place_name;
        }
        setFires(locations);
    };
    React.useEffect(() => {
        if (!data)
            return;
        handleLoc();
    }, [data]);
    if (!shelters || !data && open) {
        return 'ladads';
    }
    return React.createElement("div", { id: "defaultModal", tabIndex: "-1", "aria-hidden": "true", className: `fixed ${open ? '' : 'hidden'}  bg-black bg-opacity-40 top-0 left-0 right-0 z-50 w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full` },
        React.createElement("div", { className: "relative w-full max-w-2xl max-h-full m-auto mt-[5%]" },
            React.createElement("form", { onSubmit: handleSubmit(onSubmit) },
                React.createElement("div", { className: "relative bg-gray-700 rounded-lg shadow" },
                    React.createElement("div", { className: "flex items-start justify-between p-4 rounded-t dark:border-gray-600" },
                        React.createElement("div", null,
                            React.createElement("h3", { className: "text-xl font-semibold pl-3 text-white" }, "Fires are near your area"),
                            React.createElement("h3", { className: "text-lg  mt-1 pl-3 text-white" }, "There are reported fires near your location")),
                        React.createElement("button", { onClick: onClose, type: "button", className: "text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white", "data-modal-hide": "defaultModal" },
                            React.createElement("svg", { className: "w-3 h-3", "aria-hidden": "true", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 14 14" },
                                React.createElement("path", { stroke: "currentColor", "stroke-linecap": "round", "stroke-linejoin": "round", "stroke-width": "2", d: "m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" })),
                            React.createElement("span", { className: "sr-only" }, "Close modal"))),
                    React.createElement("div", { className: "p-6 space-y-6 pt-0 pl-7 text-center text-left" },
                        React.createElement("div", { className: 'mb-5' },
                            React.createElement("p", { className: 'text-left mb-3 mt-1.5 text-white text-[16px]' }, "Reported fires"),
                            React.createElement("table", { className: "w-full text-sm text-left text-gray-500 dark:text-gray-400" },
                                React.createElement("thead", { className: "text-xs text-white bg-gray-800" },
                                    React.createElement("tr", null,
                                        React.createElement("th", { scope: "col", className: "px-4 py-3" }, "Location"))),
                                React.createElement("tbody", null, fires.map(shelter => React.createElement("tr", { className: "bg-gray-800 text-white text-sm" },
                                    React.createElement("th", { scope: "row", className: "px-4 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white" },
                                        React.createElement("div", { className: 'flex items-center gap-4' },
                                            shelter.location,
                                            " ",
                                            React.createElement(Compass, { className: 'text-blue-500', size: 24, onClick: () => {
                                                    setOpen(false);
                                                    Cookie.set('wildfires_near', 'seen');
                                                    map.flyTo({ center: [parseFloat(shelter.longitude), parseFloat(shelter.latitude)], zoom: 250 });
                                                } })))))))),
                        React.createElement("div", { className: 'mb-5' },
                            React.createElement("p", { className: 'text-left mb-3 mt-1.5 text-white text-[16px]' }, "Shelters near you"),
                            React.createElement("table", { className: "w-full text-sm text-left text-gray-500 dark:text-gray-400" },
                                React.createElement("thead", { className: "text-xs text-white bg-gray-800" },
                                    React.createElement("tr", null,
                                        React.createElement("th", { scope: "col", className: "px-4 py-3" }, "Location"))),
                                React.createElement("tbody", null, shelters.map(fire => React.createElement("tr", { className: "bg-gray-800 text-white text-sm" },
                                    React.createElement("th", { scope: "row", className: "px-4 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white" },
                                        React.createElement("div", { className: 'flex items-center gap-4' },
                                            fire.address,
                                            "  ",
                                            fire.city,
                                            " ",
                                            fire.state,
                                            " ",
                                            React.createElement(Compass, { className: 'text-blue-500', size: 24, onClick: () => {
                                                    setOpen(false);
                                                    Cookie.set('wildfires_near', 'seen');
                                                    map.flyTo({ center: [parseFloat(fire.longitude), parseFloat(fire.latitude)], zoom: 250 });
                                                } }))))))))),
                    React.createElement("div", { className: 'p-6 pt-2' },
                        React.createElement("div", { onClick: onClose, type: 'submit', className: `bg-blue-500 w-full border-none hover:cursor-pointer text-white font-medium text-center flex justify-center gap-4 box-border text-[15px] py-2 rounded-lg ${post ? 'opacity-70 pointer-events-none' : ''}` }, "Don't show again"))))));
}
//# sourceMappingURL=NearFires.js.map