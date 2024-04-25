"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { api } from "~/trpc/react";

import { ApiFlight, type FlightDestination } from "~/server/api/routers/post";
import dayjs from "dayjs";

export function Flights({ flights }: { flights: ApiFlight[] }) {
  // const router = useRouter();
  // const [name, setName] = useState("");

  // const result = api.post.getHotAndCheap.useQuery(undefined, {
  //   refetchOnWindowFocus: false,
  // });

  // const weather = api.post.getWeather.useQuery(
  //   {
  //     lat: 52.3679,
  //     lon: 4.9035,
  //   },
  //   {
  //     refetchOnWindowFocus: false,
  //   },
  // );
  // console.log(weather.data);
  // const createPost = api.post.create.useMutation({
  //   onSuccess: () => {
  //     router.refresh();
  //     setName("");
  //   },
  // });
  console.log(flights);

  return (
    <div
      // onSubmit={(e) => {
      //   e.preventDefault();
      //   createPost.mutate({ name });
      // }}
      className="flex flex-col gap-2"
    >
      {flights?.map((flight) => (
        <FlightDestination key={flight.flightNumber} flight={flight} />
      ))}
    </div>
  );
}

const FlightDestination: React.FC<{ flight: ApiFlight }> = ({ flight }) => {
  return (
    <div className="border border-red-500 p-3">
      <h2 className="text-xl">
        {flight.destinationFull}: {flight.max_temp}°C
      </h2>
      <small>
        that temp {dayjs(flight.day_of_max_temp).format("dddd MMM D")}
      </small>
      <br />
      Departing {flight.origin} at{" "}
      {dayjs(flight.departureTime).format("HH:mm dddd MMM D")}
      <br />
      <small>
        {flight.originFull}
        <br />
        <span>{flight.flightNumber}</span>
        <br />
        score {flight.score}
      </small>
      <br />
      <br />
      <GetFlightLink flight={flight} />
    </div>
  );
};

const GetFlightLink: React.FC<{ flight: ApiFlight }> = ({ flight: flight }) => {
  // ryanair
  // example: https://www.ryanair.com/gb/en/trip/flights/select?adults=1&teens=0&children=0&infants=0&dateOut=2024-05-01&dateIn=&isConnectedFlight=false&discount=0&isReturn=false&promoCode=&originIata=BVA&destinationIata=BCN&tpAdults=1&tpTeens=0&tpChildren=0&tpInfants=0&tpStartDate=2024-05-01&tpEndDate=&tpDiscount=0&tpPromoCode=&tpOriginIata=BVA&tpDestinationIata=BCN
  const urlParams = {
    adults: "1",
    teens: "0",
    children: "0",
    infants: "0",
    dateOut: flight.departureTime.slice(0, 10),
    dateIn: "",
    isConnectedFlight: "false",
    discount: "0",
    promoCode: "",
    isReturn: "false",
    originIata: flight.origin,
    destinationIata: flight.destination,
    // tpAdults: 1,
    // tpTeens: 0,
    // tpChildren: 0,
    // tpInfants: 0,
    // tpStartDate: destination.departureTime.slice(0, 10),
    // tpEndDate: "",
    // tpDiscount: 0,
    // tpPromoCode: "",
    // tpOriginIata: destination.origin,
    // tpDestinationIata: destination.destination,
  };

  return (
    <a
      href={`https://www.ryanair.com/gb/en/trip/flights/select?${new URLSearchParams(urlParams).toString()}`}
      target="_blank"
    >
      <div className="border bg-green-800 py-3 text-center">
        Get It for {flight.price} {flight.currency}
      </div>
    </a>
  );
};
