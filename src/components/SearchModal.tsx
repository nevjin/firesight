import React from "react";

export default function SearchModal({open, setOpen, text, setText, searchOnEnter}: {text: any, setText: any, searchOnEnter: any,open: boolean, setOpen: React.Dispatch<boolean>}) {
    return  <div id="defaultModal" tabIndex="-1" aria-hidden="true"
                 className={`fixed ${open ? '' :'hidden'}  bg-black bg-opacity-40 top-0 left-0 right-0 z-50 w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full`}>
        <div className="relative w-full max-w-2xl max-h-full m-auto mt-[5%]">
            <div className="relative bg-gray-700 rounded-lg shadow">
                <div className="flex items-start justify-between p-4 rounded-t dark:border-gray-600">
                    <h3 className="text-xl font-semibold pl-3 text-gray-900 dark:text-white">
                        Search Location
                    </h3>
                    <button onClick={() => setOpen(false)} type="button"
                            className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                            data-modal-hide="defaultModal">
                        <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none"
                             viewBox="0 0 14 14">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                  stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                        </svg>
                        <span className="sr-only">Close modal</span>
                    </button>
                </div>
                <div className="p-6 space-y-6 text-center">
                    <input onKeyDown={searchOnEnter}  type="text" value={text} onChange={(e) => setText(e.target.value)}
                           className="bg-gray-600 p-2.5 text-white pl-3 focus:ring-blue-500 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full"
                           placeholder="Seattle, WA" required/>
                    <p className={'text-center mt-1.5 text-white text-sm'}>
                        Search for Current Fire and Smoke Conditions in a city, state or area.

                    </p>
                </div>
            </div>
        </div>
    </div>
}