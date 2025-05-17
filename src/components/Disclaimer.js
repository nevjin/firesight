import React from "react";
import { useForm } from "react-hook-form";
import { useSWRConfig } from "swr";
import { Fire, Warning, X } from "phosphor-react";
import { useMap } from "react-map-gl";
const fetcher = url => fetch(url).then(r => r.json());
export default function NearFires({ open, setOpen, data, shelters }) {
    const { register, handleSubmit } = useForm();
    const { mutate } = useSWRConfig();
    const { current: map } = useMap();
    return React.createElement("div", { id: "defaultModal", tabIndex: "-1", "aria-hidden": "true", className: `fixed ${open ? '' : 'hidden'}  bg-black bg-opacity-40 top-0 left-0 right-0 z-50 w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full` },
        React.createElement("div", { className: "relative w-full max-w-2xl max-h-full m-auto mt-[5%]" },
            React.createElement("div", { className: "relative bg-gray-700 rounded-lg shadow" },
                React.createElement("div", { className: "flex items-start justify-between p-4 rounded-t dark:border-gray-600" },
                    React.createElement("div", null,
                        React.createElement("h3", { className: "text-xl font-semibold pl-3 text-white" }, "Disclaimer about active fires / thermal anomalies")),
                    React.createElement(X, { onClick: () => setOpen(false), size: 24, color: 'white' })),
                React.createElement("div", { className: "p-6 space-y-6 pt-0 pl-7 text-center text-left" },
                    React.createElement("div", { className: 'mb-5 flex gap-4 text-[14px] text-white text-left' },
                        React.createElement("div", { className: 'w-[40px] text-left' },
                            React.createElement(Warning, { weight: 'fill', size: 26, className: 'mt-1', color: '#ffb52f' })),
                        "Do not use for the preservation of life or property. Satellite-derived active fire / thermal anomalies have limited accuracy."),
                    React.createElement("div", { className: 'mb-5 flex gap-1 text-[14px] text-white text-left' },
                        React.createElement("div", { className: 'w-[40px] text-left' },
                            React.createElement(Fire, { weight: 'fill', size: 26, className: 'mt-1', color: '#b80404' })),
                        "Active fire/thermal anomalies may be from fire, hot smoke, agriculture or other sources.")))));
}
//# sourceMappingURL=Disclaimer.js.map