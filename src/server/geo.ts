import { headers } from "next/headers"

export type GeoHeaders = {
  userAgent: string | null
  country: string | null
  lat: string | null
  lon: string | null
  timezone: string | null
  city: string | null
  region: string | null
  continent: string | null
}

export const geoHeaders = (): GeoHeaders => {
  const headersList = headers()

  return {
    userAgent: headersList.get("user-agent"),
    country: headersList.get("x-vercel-ip-country"),
    lat: headersList.get("x-vercel-ip-latitude"),
    lon: headersList.get("x-vercel-ip-longitude"),
    timezone: headersList.get("x-vercel-ip-timezone"),
    city: headersList.get("x-vercel-ip-city"),
    region: headersList.get("x-vercel-ip-country-region"),
    continent: headersList.get("x-vercel-ip-continent"),
  }
}
