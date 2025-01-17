import React, { useState ,useEffect,useContext} from 'react';
import { ChevronDown, Circle, MapPin } from 'lucide-react';
import LocationSearchPanel from '../components/LocationSearchPanel';
import { useRef } from 'react';
import gsap from "gsap";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import VehiclesAvailable from '../components/VehiclesAvailable';
import ConfirmedVehicle from '../components/ConfirmedVehicle';
import LookingForDriver from '../components/LookingForDriver';
import WaitForDriver from '../components/WaitForDriver';
import MapBackGround from '../components/MapBackGround';
import { SocketContext } from '../context/SocketContext';
import {UserDataContext} from '../context/UserContext'

const Home = () => {
  const [pickup, setPickup] = useState('');
  const [drop, setDrop] = useState('');
  const [panelOpen, setPanelOpen] = useState(false);
  const [vehiclePanel, setVehiclePanel] = useState(false);
  const[confirmRidePanel,setConfirmRidePanel] = useState(false);
 const [vehicleFound,setVehicleFound] = useState(false);
 const [waitingForDriver, setwaitingForDriver] = useState(false);
 const [ pickupSuggestions, setPickupSuggestions ] = useState([])
 const [ destinationSuggestions, setDestinationSuggestions ] = useState([])
 const [ activeField, setActiveField ] = useState(null)
 const [fare, setfare] = useState({})
 const [ vehicleType, setVehicleType ] = useState(null)
 const [ ride, setRide ] = useState(null)
  const vehiclePanelRef = useRef(null);
  const confirmRidePanelRef = useRef(null);
  const vehiceleFoundRef = useRef(null);
  const waitingForDriverRef = useRef(null);
  const {socket} = useContext(SocketContext)
  const {user}   = useContext(UserDataContext)
  const navigate = useNavigate();

  useEffect(() => {

      socket.emit("join", {
          userId: user?.user?._id,  // Notice the double nesting
          userType: "user"
      });
  }, [user]);

  socket.on('ride-confirmed', ride => {
    console.log("Ride confirmed at Home:", ride);
    setwaitingForDriver(true);
    setVehicleFound(false);
    setVehiclePanel(false);
    setRide(ride)
  });
  socket.on('ride-started', ride => {
    setwaitingForDriver(false)
    navigate('/riding', { state: { ride } }) // Updated navigate to include ride data
})
  const handlePickupChange = async (e) => {
    setPickup(e.target.value);
    try {
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/maps/get-suggestions`, {
        params: { address: e.target.value },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
      setPickupSuggestions(response.data.data || []); // Extract the 'data' array
    } catch (error) {
      console.error("Error fetching pickup suggestions:", error);
    }
  };

  const handleDropChange = async (e) => {
    setDrop(e.target.value);
    try {
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/maps/get-suggestions`, {
        params: { address: e.target.value },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setDestinationSuggestions(response.data.data || []); // Extract the 'data' array
    } catch (error) {
      console.error("Error fetching destination suggestions:", error);
    }
  };
  const handleFormSubmit = (e) => {
    e.preventDefault();
    console.log('Pickup:', pickup, 'Drop:', drop);
  };
  useEffect (function(){
   if(vehiclePanel){
    gsap.to(vehiclePanelRef.current,{
      transform: 'translateY(0)'})
   }else{
    gsap.to(vehiclePanelRef.current,{
      transform: 'translateY(100%)'})
   }


  },[vehiclePanel])
  useEffect (function(){
    if(confirmRidePanel){
     gsap.to(confirmRidePanelRef.current,{
       transform: 'translateY(0)'})
    }else{
     gsap.to(confirmRidePanelRef.current,{
       transform: 'translateY(100%)'})
    }


   },[confirmRidePanel])
   useEffect (function(){
    if(vehicleFound){
     gsap.to(vehiceleFoundRef.current,{
       transform: 'translateY(0)'})
    }else{
     gsap.to(vehiceleFoundRef.current,{
       transform: 'translateY(100%)'})
    }


   },[vehicleFound])
   useEffect (function(){
    if(waitingForDriver){
     gsap.to(waitingForDriverRef.current,{
       transform: 'translateY(0)'})
    }else{
     gsap.to(waitingForDriverRef.current,{
       transform: 'translateY(100%)'})
    }


   },[waitingForDriver])



   async function findTrip() {
    setPanelOpen(false);

    try {
        // First, get coordinates for pickup address
        const pickupGeocode = await axios.get(`${import.meta.env.VITE_BASE_URL}/maps/get-coordinates`, {
            params: { address: pickup },
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            }
        });

        // Then get coordinates for destination address
        const dropGeocode = await axios.get(`${import.meta.env.VITE_BASE_URL}/maps/get-coordinates`, {
            params: { address: drop },
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            }
        });
        const pickupCoordinates = pickupGeocode.data; // Example: { latitude: ..., longitude: ... }
        const dropCoordinates = dropGeocode.data;
        console.log("Pickup coordinates:", pickupCoordinates);
        console.log("Drop coordinates:", dropCoordinates);

        // Now call get-fare with the coordinates
        const fareResponse = await axios.get(`${import.meta.env.VITE_BASE_URL}/rides/get-fare`, {
            params: {
                originLat: pickupGeocode.data.latitude,
                originLng: pickupGeocode.data.longitude,
                destinationLat: dropGeocode.data.latitude,
                destinationLng: dropGeocode.data.longitude

            },
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        });

        console.log("Fare Response:", fareResponse.data);
        setfare(fareResponse.data);
        // setPickup(pickupCoordinates);
        // console.log("pickup",pickup)
        // setDrop(dropCoordinates);
        // console.log("drop",drop)
        setVehiclePanel(true);
    } catch (error) {
        console.error("Error fetching fare:", error);
    }
}
 async function createRide() {



  try{
    // First, get coordinates for pickup address
    const pickupGeocode = await axios.get(`${import.meta.env.VITE_BASE_URL}/maps/get-coordinates`, {
      params: { address: pickup },
      headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
      }
  });

  // Then get coordinates for destination address
  const dropGeocode = await axios.get(`${import.meta.env.VITE_BASE_URL}/maps/get-coordinates`, {
      params: { address: drop },
      headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
      }
  });

  const origin = [pickupGeocode.data.longitude, pickupGeocode.data.latitude];
  const destination = [dropGeocode.data.longitude, dropGeocode.data.latitude];

  const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/rides/create`, {

    origin,
    destination,
    vehicleType
  }, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    }

  })
  console.log("Create Ride Debugger",response.data);




  }   catch (error) {
    console.error("Error creating ride:", error.response?.data || error.message);
  }
}
  return (
    <div className="relative h-screen w-screen  bg-gray-100">
      {/* UBER Text at top */}
      <div
        className={`absolute top-5 left-5 z-10 transition-opacity duration-300 ${
          panelOpen ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <h1 className="text-4xl font-bold text-black">UBER</h1>
      </div>

      <MapBackGround panelOpen={panelOpen} setVehiclePanel={setVehiclePanel} />


      {/* Ride finder panel */}
      <div
        className={`absolute w-full bg-white transition-all duration-500 ${
          panelOpen ? 'h-screen top-0 z-20' : 'h-auto bottom-0'
        }`}
      >
        {/* Main input panel */}
        <div className="p-5 rounded-t-xl shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-2xl">Find a ride</h4>
            <button
              onClick={() => setPanelOpen(!panelOpen)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronDown
                className={`transform transition-transform duration-300 ${
                  panelOpen ? 'rotate-180' : ''
                }`}
                size={24}
              />
            </button>
          </div>

          <form onSubmit={handleFormSubmit} className="relative">
            {/* Location markers line */}
            <div className="absolute left-4 top-3 bottom-3 w-0.5 bg-gray-300">
              <div className="absolute -top-1 -left-1.5">
                <Circle className="w-4 h-4 text-gray-600 fill-current" />
              </div>
              <div className="absolute -bottom-1 -left-1.5">
                <MapPin className="w-4 h-4 text-gray-600" />
              </div>
            </div>

            {/* Input fields */}
            <div className="space-y-2">
              <input
                value={pickup}
                onChange={handlePickupChange}
                onClick={() => {setPanelOpen(true)
                              setActiveField('pickup')
                }}
                className="w-full bg-gray-100 px-12 py-3 rounded-lg text-base placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                type="text"
                placeholder="Enter pickup location"
              />
              <input
                value={drop}
                onChange={handleDropChange}
                onClick={() => {setPanelOpen(true)
                              setActiveField('destination')
                }}
                className="w-full bg-gray-100 px-12 py-3 rounded-lg text-base placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                type="text"
                placeholder="Enter destination"
              />
            </div>
          </form>
          <button
           onClick={findTrip}
                        className='bg-black text-white px-4 py-2 rounded-lg mt-3 w-full'>
                        Find Trip
                    </button>
        </div>

        {/* Expandable panel content */}
        <div className={`${panelOpen ? 'block' : 'hidden'} p-5`}>

        <LocationSearchPanel
  suggestions={activeField === 'pickup' ? pickupSuggestions : destinationSuggestions}
  setPickup={setPickup}
  setDrop={setDrop}

  setPanelOpen={setPanelOpen}
  setVehiclePanel={setVehiclePanel}
  activeField={activeField}
/>


        </div>
      </div>
     <div ref = {vehiclePanelRef}  className=' fixed w-full bottom-0 translate-y-full bg-white px-3 py-8  z-50'>


      <VehiclesAvailable   vehicleType={vehicleType}   setVehicleType={setVehicleType } fare = {fare} setVehiclePanel={setVehiclePanel} setConfirmRidePanel = {setConfirmRidePanel}  />

     </div>
     <div
  ref={confirmRidePanelRef}
  className={`fixed w-full bottom-0 ${
    confirmRidePanel ? 'translate-y-0' : 'translate-y-full'
  } bg-white px-3 py-3 z-50`}
  style={{ zIndex: 60 }} // Add this line
>
  <ConfirmedVehicle
  createRide={createRide}
  pickup={pickup}
  drop={drop}
  fare={fare}
  vehicleType={vehicleType}

    setConfirmRidePanel={setConfirmRidePanel}
    setVehicleFound={setVehicleFound}
  />
</div>
<div
  ref={vehiceleFoundRef}
  className={`fixed w-full bottom-0  h-screen bg-white px-3 py-3 ${vehicleFound ? 'translate-y-0' : 'translate-y-full'}` }
  style={{ zIndex: 100 }}
>
  <LookingForDriver
   createRide={createRide}
   pickup={pickup}
   drop={drop}
   fare={fare}
   vehicleType={vehicleType}

    setVehicleFound={setVehicleFound}
  />
</div>
<div
  ref = {waitingForDriverRef}
  className='fixed w-full bottom-0  h-screen bg-white px-3 py-3 '

>
  <WaitForDriver waitingForDriver={waitingForDriver} setwaitingForDriver={setwaitingForDriver}   ride={ride}
                    setVehicleFound={setVehicleFound}

  />
</div>


    </div>
  );
};

export default Home;