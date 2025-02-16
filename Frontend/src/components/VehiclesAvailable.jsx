import React, { useState } from 'react';
import { User, ArrowLeft, BadgePercent, SendHorizontal } from 'lucide-react';
import car from '../assets/car.png';
import bike from '../assets/bike.png';
import auto from '../assets/auto.png';

const VehiclesAvailable = (props) => {
    console.log('props.fare:', props.fare);

    const [couponCodes, setCouponCodes] = useState({
        car: '',
        motorcycle: '',
        auto: ''
    });

    const [error, setError] = useState({
        car: '',
        motorcycle: '',
        auto: ''
    });

    // Valid coupon codes and their discount percentages
    const validCoupons = {
        'SAVE50': 0.5,  // 50% off
        'SAVE20': 0.2   // 20% off
    };

    const vehiclesData = [
        {
            type: 'UberGo',
            seats: 4,
            time: '2 mins away',
            para: 'Affordable car rides for everyday use',
            image: car,
            fareKey: 'car',
        },
        {
            type: 'Moto',
            seats: 1,
            time: '3 mins away',
            para: 'Affordable bike rides for everyday use',
            image: bike,
            fareKey: 'motorcycle',
        },
        {
            type: 'UberAuto',
            seats: 3,
            time: '5 mins away',
            para: 'Affordable auto rides for everyday use',
            image: auto,
            fareKey: 'auto',
        },
    ];

    const handleCouponValidation = (vehicle) => {
        const fareKey = vehicle.fareKey;
        const couponCode = couponCodes[fareKey].trim().toUpperCase();

        if (!couponCode) {
            // No coupon code entered, proceed normally
            props.setVehicleType(fareKey);
            props.setConfirmRidePanel(true);
            props.setVehiclePanel(false);
            return;
        }

        const discount = validCoupons[couponCode];

        if (discount) {
            // Valid coupon code
            const originalFare = props.fare[fareKey];
            const discountedFare = originalFare * (1 - discount);

            props.setfare({
                ...props.fare,
                [fareKey]: Math.round(discountedFare)
            });

            // Proceed with ride confirmation
            props.setVehicleType(fareKey);
            props.setConfirmRidePanel(true);
            props.setVehiclePanel(false);

            // Reset error
            setError(prevErrors => ({
                ...prevErrors,
                [fareKey]: ''
            }));
        } else {
            // Invalid coupon code
            setError(prevErrors => ({
                ...prevErrors,
                [fareKey]: 'Invalid coupon code'
            }));
        }
    };

    const handleCouponChange = (vehicleFareKey, value) => {
        setCouponCodes(prevCodes => ({
            ...prevCodes,
            [vehicleFareKey]: value
        }));

        // Reset error when user starts typing again
        setError(prevErrors => ({
            ...prevErrors,
            [vehicleFareKey]: ''
        }));
    };

    return (
        <div className="flex flex-col gap-4 p-4 mb-10 w-full">
            <ArrowLeft onClick={() => props.setVehiclePanel(false)} />
            <h1 className="font-bold text-2xl">Choose a Vehicle</h1>

            {vehiclesData.map((vehicle, index) => (
                <div
                    key={index}
                    className="flex border-2 active:border-black mb-2 rounded-xl w-full p-3 items-center justify-between shadow-md"
                >
                    <img
                        src={vehicle.image}
                        alt={vehicle.type}
                        className="h-14 w-20 object-cover rounded-md"
                    />
                    <div className="ml-2 w-1/2">
                        <h4 className="font-medium text-base">
                            {vehicle.type} <span><User className="inline-block" size={16} /> {vehicle.seats}</span>
                        </h4>
                        <h5 className="font-medium text-sm">{vehicle.time}</h5>
                        <p className="font-normal text-xs text-gray-600">{vehicle.para}</p>

                        {/* Coupon Input */}
                        <div className="flex gap-2 items-center justify-between">
                            <BadgePercent />
                            <input
                                type="text"
                                placeholder="Enter Code"
                                value={couponCodes[vehicle.fareKey]}
                                onChange={(e) => handleCouponChange(vehicle.fareKey, e.target.value)}
                                className="border border-gray-600 rounded-md px-2 py-1 mt-2 w-full"
                            />
                            <button onClick={() => handleCouponValidation(vehicle)}>
                                <SendHorizontal />
                            </button>
                        </div>

                        {/* Display error message if invalid coupon */}
                        {error[vehicle.fareKey] && (
                            <p className="text-red-500 text-xs mt-1">{error[vehicle.fareKey]}</p>
                        )}
                    </div>

                    <div className="flex flex-col items-end gap-2">
                        <h2 className="font-medium text-base">
                            ₹{props.fare?.[vehicle.fareKey] || 'N/A'}
                        </h2>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default VehiclesAvailable;
