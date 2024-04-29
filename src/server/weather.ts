// import { OWM } from 'openweather-api-node'; // Assuming 'owm-client' is a fictional TypeScript-compatible library for OpenWeatherMap

import { OpenWeatherAPI } from "openweather-api-node"
import { env } from "~/env"

const weather = new OpenWeatherAPI({
  key: env.OPENWEATHER_KEY,
  units: "metric",
})

interface Coord {
  lon: number
  lat: number
}

interface City {
  id: number
  name: string
  coord: Coord
  country: string
  population: number
  timezone: number
}

interface Weather {
  id: number
  main: string
  description: string
  icon: string
}

interface Temp {
  day: number
  min: number
  max: number
  night: number
  eve: number
  morn: number
}

interface FeelsLike {
  day: number
  night: number
  eve: number
  morn: number
}

interface ListItem {
  dt: number
  sunrise: number
  sunset: number
  temp: Temp
  feels_like: FeelsLike
  pressure: number
  humidity: number
  weather: Weather[]
  speed: number
  deg: number
  gust: number
  clouds: number
  pop: number
  rain?: number
}

interface WeatherResponse {
  city: City
  cod: string
  message: number
  cnt: number
  list: ListItem[]
}

export type WeatherData = {
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

export async function getDailyForecast(
  lat: number,
  lon: number,
): Promise<AirportWeather> {
  const dailyForecast: WeatherResponse | null = (await fetch(
    `https://api.openweathermap.org/data/2.5/forecast/daily?lat=${lat}&lon=${lon}&cnt=16&units=metric&appid=${env.OPENWEATHER_KEY}`,
  )
    .then((res) => res.json())
    .catch(console.error)) as WeatherResponse

  const forecast: WeatherData[] = dailyForecast?.list.map((part) => {
    const {
      feels_like,
      temp,
      weather,
      dt,
      // lat,
      // lon,
    } = part

    return {
      time: new Date(dt * 1000),
      description: weather[0]?.description ?? "",
      temp: temp.day,
      realFeel: feels_like.day,
      icon: weather[0]?.icon ?? "",
      pop: part.pop,
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
