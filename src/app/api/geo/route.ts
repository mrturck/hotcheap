import { headers } from "next/headers"
import { geoHeaders } from "~/server/geo"

export async function GET() {
  // const headersList = headers()
  const geo = geoHeaders()
  return Response.json({ geo })
}
