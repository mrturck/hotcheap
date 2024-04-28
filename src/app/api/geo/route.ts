import type { NextApiRequest, NextApiResponse } from "next"
import { headers } from "next/headers"

// interface ResponseData {
//   message?: string
//   headers?: unknown
// }

export async function GET(
  req: Request,
  // res: NextApiResponse<ResponseData>,
) {
  const headersList = headers()
  return Response.json({ headers: [...headersList.entries()] })
}
