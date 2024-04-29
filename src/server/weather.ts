// import { OWM } from 'openweather-api-node'; // Assuming 'owm-client' is a fictional TypeScript-compatible library for OpenWeatherMap

import { OpenWeatherAPI } from "openweather-api-node"
import { env } from "~/env"

const weather = new OpenWeatherAPI({
  key: env.OPENWEATHER_KEY,
  units: "metric",
})

type WeatherData = {
  time: Date
  description: string
  icon: string
  temp: number
  realFeel: number
  pop: number
  // windSpeed: number
  // rain: any // Adjust the type based on actual data structure
  // snow: any // Adjust the type based on actual data structure
}

export type AirportWeather = {
  maxTemp: number
  dayOfMaxTemp: Date
  forecast: WeatherData[]
}

export async function getThreeHourlyForecastFiveDays(
  lat: number,
  lon: number,
): Promise<AirportWeather> {
  const threeHourlyForecast = await weather.getForecast(undefined, {
    coordinates: {
      lat,
      lon,
    },
  })

  // const threeHourlyForecast = [
  //   {
  //     dt: new Date(),
  //     weather: {
  //       description: "Sunny",
  //       icon: { url: "01d" },
  //       pop: 0,
  //       temp: {
  //         cur: 10 + Math.random() * 20,
  //       },
  //       feelsLike: {
  //         cur: 20,
  //       },
  //     },
  //   },
  // ]

  const forecast: WeatherData[] = threeHourlyForecast.map((part) => {
    const {
      weather: { description, icon, pop, temp, feelsLike },
      dt,
      // lat,
      // lon,
    } = part

    return {
      time: dt,
      description,
      temp: temp.cur,
      realFeel: feelsLike.cur,
      icon: icon.url,
      pop,
    }
  })

  const maxForecast = forecast.reduce((acc, curr) =>
    curr.temp > acc.temp ? curr : acc,
  )

  return {
    maxTemp: maxForecast.temp,
    dayOfMaxTemp: maxForecast.time,
    forecast,
  }
}
