import React from "react";
import {useForm} from "react-hook-form";
import axios from "axios";
import {useSWRConfig} from "swr";
import {ClassicSpinner} from 'react-spinners-kit'
import {useMap} from "react-map-gl";
export default function AddShelterModal({open, setOpen}: {open: boolean, setOpen: React.Dispatch<boolean>}) {
    const {register, handleSubmit} = useForm();
    const { mutate } = useSWRConfig()
    const [post, setPost] = React.useState(false)
    const {current:map} =useMap();

    const onSubmit = (data) => {
        return
        setPost(true)
        data.latitude = parseFloat(data.latitude)
        data.longitude = parseFloat(data.longitude)

        axios.post('https://api.imfate.xyz/api/v1/shelters', data).then(data => {
            mutate('https://api.imfate.xyz/api/v1/shelters')
            setPost(false)
            setOpen(false)
            //alert("Shelter has been added");
            map.flyTo({center: data.data.center, zoom: 8})
        }).catch(err => {
            setPost(false);
            alert("Adding shelter failed")
        })
    }
    return  <div id="defaultModal" tabIndex="-1" aria-hidden="true"
                 className={`fixed ${open ? '' :'hidden'}  bg-black bg-opacity-40 top-0 left-0 right-0 z-50 w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full`}>
        <div className="relative w-full max-w-2xl max-h-full m-auto mt-[5%]">
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="relative bg-gray-700 rounded-lg shadow">
                    <div className="flex items-start justify-between p-4 rounded-t dark:border-gray-600">
                        <h3 className="text-xl font-semibold pl-3 text-white">
                            Add a shelter
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
                    <div className="p-6 space-y-6 text-center text-left">
                        <div className={'mb-5'}>
                            <p className={'text-left mb-3 mt-1.5 text-white text-sm'}>
                                Shelter Name
                            </p>
                            <input {...register('name')}  type="text"
                                   className="bg-gray-600 p-2.5 text-white pl-3 focus:ring-blue-500 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full"
                                   required/>
                        </div>
                        <div className={'mb-5'}>
                            <p className={'text-left mb-3 text-white text-sm'}>
                                Address
                            </p>
                            <input {...register('address')}  type="text"
                                   className="bg-gray-600 p-2.5 text-white pl-3 focus:ring-blue-500 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full"
                                   required/>
                        </div>
                        <div className={'mb-5'}>
                            <p className={'text-left mb-3 text-white text-sm'}>
                                Zip Code
                            </p>
                            <input {...register('zip_code')}  type="text"
                                   className="bg-gray-600 p-2.5 text-white pl-3 focus:ring-blue-500 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full"
                                   required/>
                        </div>
                        <div className={'mb-5'}>
                            <p className={'text-left mb-3 text-white text-sm'}>
                                State
                            </p>
                            <input {...register('state')}  type="text"
                                   className="bg-gray-600 p-2.5 text-white pl-3 focus:ring-blue-500 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full"
                                   required/>
                        </div>
                        <div className={'mb-5'}>
                            <p className={'text-left mb-3 text-white text-sm'}>
                                City
                            </p>
                            <input {...register('city')}  type="text"
                                   className="bg-gray-600 p-2.5 text-white pl-3 focus:ring-blue-500 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full"
                                   required/>
                        </div>
                        {/*<div className={'mb-5'}>*/}
                        {/*    <p className={'text-left mb-3 text-white text-sm'}>*/}
                        {/*        Latitude*/}
                        {/*    </p>*/}
                        {/*    <input {...register('latitude')}  type="number"*/}
                        {/*           className="bg-gray-600 p-2.5 text-white pl-3 focus:ring-blue-500 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full"*/}
                        {/*           required/>*/}
                        {/*</div>*/}
                        {/*<div className={'mb-1'}>*/}
                        {/*    <p className={'text-left mb-3 text-white text-sm'}>*/}
                        {/*        Longitude*/}
                        {/*    </p>*/}
                        {/*    <input {...register('longitude')}  type="number"*/}
                        {/*           className="bg-gray-600 p-2.5 text-white pl-3 focus:ring-blue-500 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full"*/}
                        {/*           required/>*/}
                        {/*</div>*/}
                    </div>
                    <div className={'p-6 pt-2'}>
                        <button type={'submit'} className={`bg-blue-500 w-full border-none hover:cursor-pointer text-white font-medium text-center flex justify-center gap-4 box-border text-[15px] py-2 rounded-lg ${post ? 'opacity-70 pointer-events-none' : ''}`}>{post ? <>

                            <div className={'mt-0.5'}>
                                <ClassicSpinner size={14}/>
                            </div>
                            <div>
                              Submitting..
                            </div>
                        </> : 'Submit'}</button>

                    </div>
                </div>

            </form>
        </div>
    </div>
}