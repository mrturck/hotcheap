"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { api } from "~/trpc/react";

import { type FlightDestination } from "~/server/api/routers/post";

export function Flights() {
  const router = useRouter();
  const [name, setName] = useState("");

  const result = api.post.getHotAndCheap.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  const weather = api.post.getWeather.useQuery({
    lat: 52.3679,
    lon: 4.9035,
  }, {
    refetchOnWindowFocus: false
  });
  console.log(weather.data)
  // const createPost = api.post.create.useMutation({
  //   onSuccess: () => {
  //     router.refresh();
  //     setName("");
  //   },
  // });
  console.log(result.data);

  return (
    <div
      // onSubmit={(e) => {
      //   e.preventDefault();
      //   createPost.mutate({ name });
      // }}
      className="flex flex-col gap-2"
    >
      {result.data?.map((destination) => (
        <FlightDestination
          key={destination.destination}
          destination={destination}
        />
      ))}
    </div>
  );
}

const FlightDestination: React.FC<{ destination: FlightDestination }> = ({
  destination,
}) => {
  return (
    <div className="border border-red-500 p-3">
      <h2 className="text-xl">destination: {destination.destination}</h2>
      <br />
      departureDate: {destination.departureDate}
      <br />
      price.total: {destination.price.total}
      <br />
      origin: {destination.origin}
      <br />
      type: {destination.type}
      <br />
    </div>
  );
};
