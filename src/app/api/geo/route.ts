import { geoHeaders } from "~/server/geo"

export async function GET() {
  const geo = geoHeaders()
  return Response.json({ geo })
}
