import { env } from "~/env"

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
  avgTemp: number
  forecast: WeatherData[]
}

export async function getDailyForecast(
  lat: number,
  lon: number,
  dateFrom: Date,
): Promise<AirportWeather | null> {
  let dailyForecast: WeatherResponse

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast/daily?lat=${lat}&lon=${lon}&cnt=16&units=metric&appid=${env.OPENWEATHER_KEY}`,
      {
        next: {
          revalidate: 60 * 30,
        },
      },
    )
    dailyForecast = (await response.json()) as WeatherResponse
  } catch (error) {
    console.error(error)
    return null
  }

  const forecast: WeatherData[] = dailyForecast?.list
    ?.map((part) => {
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
        icon: `https://openweathermap.org/img/w/${weather[0]?.icon ?? ""}.png`,
        pop: part.pop,
      }
    })
    .filter((item) => item.time >= dateFrom)
    .slice(0, 5)

  const avgTemp =
    forecast?.reduce((acc, curr) => acc + curr.temp, 0) / forecast?.length

  return {
    avgTemp,
    forecast,
  }
}
