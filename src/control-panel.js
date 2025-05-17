import React from 'react';
import axios from "axios";
import { useMap } from "react-map-gl";
export default function ControlPanel() {
    const [search, setSearch] = React.useState(false);
    const [text, setText] = React.useState();
    const [addShelter, setAddShelter] = React.useState(true);
    const { current: map } = useMap();
    const searchOnEnter = async (event) => {
        if (event.key === "Enter") {
            alert("enter");
            var data = await axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${text}.json?access_token=pk.eyJ1IjoiZmFrZXVzZXJnaXRodWIiLCJhIjoiY2pwOGlneGI4MDNnaDN1c2J0eW5zb2ZiNyJ9.mALv0tCpbYUPtzT7YysA2g`);
            map.flyTo({ center: data.data.features[0].center, zoom: 250 });
            setSearch(false);
            setText();
        }
    };
    return (React.createElement(React.Fragment, null,
        React.createElement("div", { id: "defaultModal", tabIndex: "-1", "aria-hidden": "true", className: `fixed ${search ? '' : 'hidden'}  bg-black bg-opacity-40 top-0 left-0 right-0 z-50 w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full` },
            React.createElement("div", { className: "relative w-full max-w-2xl max-h-full m-auto mt-[5%]" },
                React.createElement("div", { className: "relative bg-gray-700 rounded-lg shadow" },
                    React.createElement("div", { className: "flex items-start justify-between p-4 rounded-t dark:border-gray-600" },
                        React.createElement("h3", { className: "text-xl font-semibold pl-3 text-white", style: { color: 'white !important' } }, "Search Location"),
                        React.createElement("button", { onClick: () => setSearch(false), type: "button", className: "text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white", "data-modal-hide": "defaultModal" },
                            React.createElement("svg", { className: "w-3 h-3", "aria-hidden": "true", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 14 14" },
                                React.createElement("path", { stroke: "currentColor", "stroke-linecap": "round", "stroke-linejoin": "round", "stroke-width": "2", d: "m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" })),
                            React.createElement("span", { className: "sr-only" }, "Close modal"))),
                    React.createElement("div", { className: "p-6 space-y-6 text-center" },
                        React.createElement("input", { onKeyDown: searchOnEnter, type: "text", value: text, onChange: (e) => setText(e.target.value), className: "bg-gray-600 p-2.5 text-white pl-3 focus:ring-blue-500 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full", placeholder: "Seattle, WA", required: true }),
                        React.createElement("p", { className: 'text-center mt-1.5 text-white text-sm' }, "Search for Current Fire and Smoke Conditions in a city, state or area."))))),
        React.createElement("div", { className: '' }),
        React.createElement("div", { className: "control-panel  rounded-md absolute right-0 top-0 m-[20px]" },
            React.createElement("div", { className: 'flex items-center gap-4' },
                React.createElement("div", { onClick: () => setSearch(true), className: 'w-full h-full flex items-center gap-4 p-2 rounded-md w-9 h-9 bg-white shadow-md hover:cursor-pointer' })))));
}
//# sourceMappingURL=control-panel.js.map