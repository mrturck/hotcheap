import { getCheapestFlights } from "../server/ryanair"

// run using: npx tsx src/scripts/test-flights.ts

// if process is this file, run the script
if (process.argv[1]?.includes("src/scripts/main.ts")) {
  const a = await getCheapestFlights({
    // departureTimeFrom: "00:00",
    // departureTimeTo: "23:59",
    dateFrom: "2024-05-03",
    dateTo: "2024-05-04",
    airport: "STN",
    destinationAirport: "DUB",
  })

  console.log(JSON.stringify(a, null, 2))
}
