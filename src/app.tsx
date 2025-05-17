import * as React from 'react';
import {useState, useMemo, useCallback} from 'react';
import {createRoot} from 'react-dom/client';
import Map, {
    Marker,
    Popup,
    NavigationControl,
    FullscreenControl,
    ScaleControl,
    GeolocateControl, useMap, Layer, Source, CircleLayer,
} from 'react-map-gl';
import useSWR, {useSWRConfig} from "swr";
import './index.css'
import {Compass, FireSimple, House, HouseLine, Info, MagnifyingGlass} from "phosphor-react";
import AddShelterModal from "./components/AddShelterModal";
import axios from "axios";
import Cookie from 'js-cookie'
import Disclaimer from './components/Disclaimer';
import SearchModal from './components/SearchModal';
import {useForm} from "react-hook-form";
const TOKEN = 'pk.eyJ1IjoiY29vbHJ1bGVzIiwiYSI6ImNsbW5uZDZhNjBzNnoycnBuZnZsZDNocTUifQ.RI75Yx9uJdNgqSIaHwi41A'; // Set your mapbox token here

const fetcher = url => fetch(url).then(r => r.json())

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
function ControlPanel({setFireModal}: any) {
    const [search, setSearch] = React.useState(false);
    const [text, setText] = React.useState();
    const [addShelter, setAddShelter] = React.useState(false);
    const {current: map} = useMap();

    const searchOnEnter = async (event) => {
        if (event.key ==="Enter") {
            var data =await axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${text}.json?access_token=pk.eyJ1IjoiZmFrZXVzZXJnaXRodWIiLCJhIjoiY2pwOGlneGI4MDNnaDN1c2J0eW5zb2ZiNyJ9.mALv0tCpbYUPtzT7YysA2g`)
            map.flyTo(
                {center: data.data.features[0].center, zoom: 9}
            )
            setSearch(false);
            setText();
        }

    }

    React.useEffect(()=> {
        map.loadImage(
            '/firered.png',
            (error, image) => {
                map.addImage('fire', image);

                if (error) throw error;})
    }, [])


    return (
        <>
            <AddShelterModal open={addShelter} setOpen={setAddShelter}/>
            <SearchModal setText={setText} text={text} searchOnEnter={searchOnEnter} open={search} setOpen={setSearch}/>
            <div className={''}>

            </div>
            <img src={'/logo.svg'} className={'left-[50px] top-0 absolute w-48'}/>

            <div className="control-panel  rounded-md absolute right-0 top-0 m-[20px]">
                <div className={'flex items-center gap-4'}>
                    <div onClick={() => setSearch(true)} className={'w-full h-full flex items-center gap-4 p-2 rounded-md w-9 h-9 bg-white shadow-md hover:cursor-pointer'}>
                        <MagnifyingGlass weight={'duotone'} size={23}/>
                    </div>
                    <div onClick={() => setAddShelter(true)} className={'w-full h-full flex items-center gap-4 p-2 rounded-md w-9 h-9 bg-white shadow-md hover:cursor-pointer'}>
                        <HouseLine weight={'duotone'} size={23}/>
                    </div>
                    <div onClick={() => setFireModal(true)} className={'w-full h-full flex items-center gap-4 p-2 rounded-md w-9 h-9 bg-white shadow-md hover:cursor-pointer'}>
                        <FireSimple weight={'duotone'} size={23}/>
                    </div>
                </div>
            </div>
        </>
    );
}

const ZoomBtn = ({popUpInfo, close}:{popUpInfo: any, close:() => void}) => {
    const {current:map} =useMap()
    return <div onClick={() => {
        map.flyTo(
            {center: [popUpInfo.longitude, popUpInfo.latitude], zoom: 15}
        )
        close()
    }} className={'flex items-center gap-3 bg-blue-700 shadow-lg hover:cursor-pointer w-full h-[25px] mt-3 font-medium text-white justify-center rounded-md'}>
        <MagnifyingGlass weight={'duotone'}/> Zoom
    </div>
}


const layerStyle: CircleLayer = {
    id: 'anomaly',
    type: 'circle',
    paint: {
        'circle-radius': 5,
        'circle-color': '#d95722'
    }
};
const layerStyleFire: any = {
    id: 'fire',
    'type': 'symbol',
    filter: ['!', ['has', 'point_count']],

    layout: {
        'icon-image': 'fire',
        'icon-size': 0.1
    }
};


function NearFires({open, setOpen, data, shelters}: {shelters: any[],data: any[],open: boolean, setOpen: React.Dispatch<boolean>}) {
    const {register, handleSubmit} = useForm();
    const { mutate } = useSWRConfig()
    const [post, setPost] = React.useState(false)
    const [fires, setFires] = React.useState([])

    const {current:map} = useMap();
    const onClose = () => {
        Cookie.set('wildfires_near', 'seen')
        setOpen(false);
    }
    const onSubmit = (data) => {
        setPost(true)
        data.latitude = parseFloat(data.latitude)
        data.longitude = parseFloat(data.longitude)

        axios.post('https://api.imfate.xyz/api/v1/shelters', data).then(data => {
            mutate('https://api.imfate.xyz/api/v1/shelters')
            setPost(false)
            setOpen(false)
        })
    }

    const handleLoc =async () => {
        var locations = data.slice(0,4);

        for (var location of locations) {
            var reversegeo = await axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${location.longitude},${location.latitude}.json?access_token=pk.eyJ1IjoiY29vbHJ1bGVzIiwiYSI6ImNsbW5uZDZhNjBzNnoycnBuZnZsZDNocTUifQ.RI75Yx9uJdNgqSIaHwi41A`)
            location.location = reversegeo.data.features[0].place_name;
        }

        setFires(locations as any)
    }
    React.useEffect(() => {
        if (!data) return;

        handleLoc()
    }, [data])
    if (!shelters || !data && open) {
        return 'ladads'
    }
    return  <div id="defaultModal" tabIndex="-1" aria-hidden="true"
                 className={`fixed ${open ? '' :'hidden'}  bg-black bg-opacity-40 top-0 left-0 right-0 z-50 w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full`}>
        <div className="relative w-full max-w-2xl max-h-full m-auto mt-[5%]">
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="relative bg-gray-700 rounded-lg shadow">
                    <div className="flex items-start justify-between p-4 rounded-t dark:border-gray-600">
                        <div>
                            <h3 className="text-xl font-semibold pl-3 text-white">
                                {fires.length > 0 ? 'Reported fires near your location' : 'No reported fires near you'}
                            </h3>
                            <h3 className="text-lg  mt-1 pl-3 text-white">
                                {fires.length > 0 ? 'There are reported fires near your area' : 'There are no reported fires near you'}
                            </h3>
                        </div>
                        <button onClick={onClose} type="button"
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
                    {fires.length > 0 ? <>
                        <div className="p-6 space-y-6 pt-0 pl-7 text-center text-left" style={{display: fires.length && 'none'}}>
                            <div className={'mb-5'}>
                                <p className={'text-left mb-3 mt-1.5 text-white text-[16px]'}>
                                    Reported fires
                                </p>
                                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                    <thead
                                        className="text-xs text-white bg-gray-800">
                                    <tr>
                                        <th scope="col" className="px-4 py-3">
                                            Location
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {fires.map(shelter => <tr className="bg-gray-800 text-white text-sm">
                                        <th scope="row"
                                            className="px-4 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                            <div className={'flex items-center gap-4'}>
                                                {shelter.location} <Compass className={'text-blue-500'} size={24} onClick={() => {
                                                setOpen(false)
                                                Cookie.set('wildfires_near', 'seen')

                                                map.flyTo(
                                                    {center: [parseFloat(shelter.longitude), parseFloat(shelter.latitude)], zoom: 250}
                                                )
                                            }}/>
                                            </div>
                                        </th>
                                        {/*<td className="px-4 py-4">*/}
                                        {/*    {fire.FireCause}*/}
                                        {/*</td>*/}
                                        {/*<td className="px-4 py-4">*/}
                                        {/*    {moment(fire.FireDiscoveryDateTime).format('lll')}*/}
                                        {/*</td>*/}
                                    </tr>)}
                                    </tbody>
                                </table>
                            </div>
                            <div className={'mb-5'}>
                                <p className={'text-left mb-3 mt-1.5 text-white text-[16px]'}>
                                    Shelters near you
                                </p>
                                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                    <thead
                                        className="text-xs text-white bg-gray-800">
                                    <tr>
                                        <th scope="col" className="px-4 py-3">
                                            Location
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {shelters.map(fire => <tr className="bg-gray-800 text-white text-sm">
                                        <th scope="row"
                                            className="px-4 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                            <div className={'flex items-center gap-4'}>
                                                {fire.address}  {fire.city} {fire.state} <Compass className={'text-blue-500'} size={24} onClick={() => {
                                                setOpen(false)
                                                Cookie.set('wildfires_near', 'seen')

                                                map.flyTo(
                                                    {center: [parseFloat(fire.longitude), parseFloat(fire.latitude)], zoom: 250}
                                                )
                                            }}/>
                                            </div>
                                        </th>

                                        {/*<td className="px-4 py-4">*/}
                                        {/*    {fire.FireCause}*/}
                                        {/*</td>*/}
                                        {/*<td className="px-4 py-4">*/}
                                        {/*    {moment(fire.FireDiscoveryDateTime).format('lll')}*/}
                                        {/*</td>*/}
                                    </tr>)}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </> : null}
                    <div className={'p-6 pt-2'}>
                        <div onClick={onClose}  type={'submit'} className={`bg-blue-500 w-full border-none hover:cursor-pointer text-white font-medium text-center flex justify-center gap-4 box-border text-[15px] py-2 rounded-lg ${post ? 'opacity-70 pointer-events-none' : ''}`}>Close</div>

                    </div>
                </div>

            </form>
        </div>
    </div>
}
export default function App() {
  const [popupInfo, setPopupInfo] = useState(null);
  const [shelterModal, setShelterModal] = React.useState(false);
  const [nearFires, setNearFires] = React.useState([])
    const [nearShelters, setNearShelters] = React.useState([])
    const [disclaimer, setDisclaimer] = React.useState(false);
    const [firesModal, setFiresModal] = React.useState(null);
    const {data} = useSWR('https://api.imfate.xyz/api/v1/data', fetcher);
  const {data: shelters} = useSWR<{
      name: string,
      address: string,
      zip_code: string,
      state: string,
      city: string,
      latitude: string,
      longitude: string
  }[]>("https://api.imfate.xyz/api/v1/shelters", fetcher)

    const onHover = useCallback(event => {
        if(!event?.features?.length) return
        setPopupInfo({...event.features[0].properties})


    }, []);
    const sheltersRender = useMemo(
        () =>{
            let sheltersd = shelters ? shelters : [];
            return sheltersd.map((city, index) => (
                <Marker
                    key={`marker-${index}`}
                    longitude={city.longitude}
                    latitude={city.latitude}
                    anchor="bottom"
                    onClick={e => {
                        // If we let the click event propagates to the map, it will immediatelny close the popup
                        // with `closeOnClick: true`
                        e.originalEvent.stopPropagation();
                        city.shelter = true;
                        setPopupInfo(city);
                    }}
                >
                    <House weight={'duotone'} className={'text-blue-500'} size={20}/>
                </Marker>
            ))
        },
        [shelters]
    );




    const geojsonFires: any = {
        type: 'FeatureCollection',
        features:  data ?  data.filter(x => x.fire).map(dx => {
            return {
                "geometry": {
                    "type": "Point",
                    "coordinates": [parseFloat(dx.longitude), parseFloat(dx.latitude)]
                },
                type: "Feature",
                properties: {
                    ...dx
                }
            }
        }) : []
    };

    const geojson: any = {
        type: 'FeatureCollection',
        features:  data ?  data.filter(x => !x.fire).map(dx => {
            return {
                "geometry": {
                    "type": "Point",
                    "coordinates": [parseFloat(dx.longitude), parseFloat(dx.latitude)]
                },
                type: "Feature",
                properties: {
                    ...dx
                }
            }
        }) : []
    };



    React.useEffect(()=> {
        if (!data ||!shelters)return;
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(successFunction, errorFunction);
        } else {
            console.debug("Geolocation is not supported by this browser.");
        }

        function successFunction(position) {
            let nearFires =  data.map(x => {
                x.distance = distance(x.latitude, x.longitude, position.coords.latitude, position.coords.longitude, 'K')
                return x;
            }).filter(x => x.distance < 300)

            if (nearFires.length > 0) {
                setNearFires(nearFires)
                setNearShelters( data.map(x => {
                    x.distance = distance(x.latitude, x.longitude, position.coords.latitude, position.coords.longitude, 'K')
                    return x;
                }).filter(x => x.distance < 300))
                if (!Cookie.get('wildfires_near')) {
                    setFiresModal(true)
                }
            } else {
                setNearFires(nearFires)
                setNearShelters( data.map(x => {
                    x.distance = distance(x.latitude, x.longitude, position.coords.latitude, position.coords.longitude, 'K')
                    return x;
                }).filter(x => x.distance < 300))
            }
        }

        function errorFunction() {
            console.debug("Unable to retrieve your location.");
        }
    }, [data, shelters])
  if (!data) {
      return
  }




  return (
    <>
      <Map
        initialViewState={{
          latitude: 40,
          longitude: -100,
          zoom: 3.5,
          bearing: 0,
          pitch: 0
        }}


        onClick={onHover}
        interactiveLayerIds={['fire', 'anomaly']}

        mapStyle="mapbox://styles/mapbox/dark-v9?optimize=true"
        mapboxAccessToken={TOKEN}
      >

        <GeolocateControl position="top-left" />
        <FullscreenControl position="top-left" />
        <NavigationControl position="top-left" />
        <ScaleControl />

          <Source id="fires" type="geojson" data={geojsonFires} clusterRadius={10}>
              <Layer  {...layerStyleFire} />
          </Source>
          <Source id="anomalies" type="geojson" data={geojson}>
              <Layer {...layerStyle} />
          </Source>

          {sheltersRender}

        {popupInfo && (
          <Popup
            anchor="top-left"
            offset={[0,0]}
            longitude={Number(popupInfo.longitude)}
            latitude={Number(popupInfo.latitude)}
            key={Number(popupInfo.longitude)+ Number(popupInfo.latitude)}
            onClose={() => setPopupInfo(null)}
          >
            <div className={'text-white text-[15px]  mb-3 font-medium'}>{popupInfo.shelter ? 'Emergency Shelter' : popupInfo.fire ? 'Fire' : 'Satellite Fire Anomaly'}</div>
              {popupInfo.shelter && <>
                  <div className={'flex items-center gap-2 text-white'}>
                      <div className={'bg-[#244153] flex-1 p-1 pl-2 box-border rounded-sm'}>Name</div>
                      <div className={'bg-[#244153] flex-1 p-1 pl-2 box-border rounded-sm truncate'}>{popupInfo.name}</div>

                  </div>
                  <div className={'flex items-center gap-2 text-white mt-2'}>
                      <div className={'bg-[#244153] flex-1 p-1 pl-2 box-border rounded-sm'}>Address</div>
                      <div className={'bg-[#244153] flex-1 p-1 pl-2 box-border rounded-sm truncate'}>{popupInfo.address}</div>

                  </div>
              </>}

              {popupInfo.fire  && !popupInfo.shelter&& <>
                  <div className={'flex items-center gap-2 text-white'}>
                      <div className={'bg-[#244153] flex-1 p-1 pl-2 box-border rounded-sm'}>Fire ID</div>
                      <div className={'bg-[#244153] flex-1 p-1 pl-2 box-border rounded-sm truncate'}>{popupInfo.UniqueFireIdentifier}</div>

                  </div>
                  <div className={'flex items-center gap-2 text-white mt-2'}>
                  <div className={'bg-[#244153] flex-1 p-1 pl-2 box-border rounded-sm'}>Incident MGMT Org</div>
                  <div className={'bg-[#244153] flex-1 p-1 pl-2 box-border rounded-sm truncate'}>{popupInfo.IncidentManagementOrganization ? popupInfo.IncidentManagementOrganization : 'Unknown'}</div>

              </div>

                  <div className={'flex items-center gap-2 text-white mt-2'}>
                      <div className={'bg-[#244153] flex-1 p-1 pl-2 box-border rounded-sm'}>% Contained</div>
                      <div className={'bg-[#244153] flex-1 p-1 pl-2 box-border rounded-sm truncate'}>{popupInfo.PercentContained ? popupInfo.PercentContained : 0}%</div>

                  </div>
                  <div className={'flex items-center gap-2 mt-2 text-white'}>
                      <div className={'bg-[#244153] flex-1 p-1 pl-2 box-border rounded-sm'}>Irwin ID</div>
                      <div className={'bg-[#244153] flex-1 p-1 pl-2 box-border rounded-sm truncate'}>{popupInfo.IrwinID}</div>

                  </div>
              </>}
              {!popupInfo.fire && !popupInfo.shelter && <>
                  <div className={'flex items-center gap-2 text-white'}>
                      <div className={'bg-[#244153] flex-1 p-1 pl-2 box-border rounded-sm'}>Confidence</div>
                      <div className={'bg-[#244153] flex-1 p-1 pl-2 box-border rounded-sm'}>{popupInfo.confidence}</div>

                  </div>
                  <div className={'flex items-center gap-2 mt-2 text-white'}>
                      <div className={'bg-[#244153] flex-1 p-1 pl-2 box-border rounded-sm'}>Version</div>
                      <div className={'bg-[#244153] flex-1 p-1 pl-2 box-border rounded-sm'}>{popupInfo.version}</div>

                  </div>
                  </>}
              <ZoomBtn close={() => {
                  setPopupInfo(null)
              }} popUpInfo={popupInfo}/>
            {/*<div className={'bg-blue-800 text-center flex justify-center text-white font-medium p-2 box-border rounded-md'}>*/}
            {/*    Satellite*/}
            {/*</div>*/}
          </Popup>
        )}
          <NearFires data={nearFires} shelters={shelters} open={firesModal} setOpen={setFiresModal}/>
          <Disclaimer open={disclaimer} setOpen={setDisclaimer}/>

          <ControlPanel setFireModal={setFiresModal}/>
          <div className={'absolute right-3 bottom-10'}>
           <div onClick={() => setDisclaimer(true)} className={'flex items-center hover:cursor-pointer gap-3 p-2 text-[15px] rounded-md font-medium  bg-orange-500  bg-opacity-40'}>
               <Info className={'text-orange-500'} size={20}/> <h1>Disclaimer regarding fires</h1>
           </div>
          </div>
      </Map>


    </>
  );
}

export function renderToDom(container) {
  createRoot(container).render(<App />);
}
