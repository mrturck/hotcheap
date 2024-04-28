import type { NextApiRequest, NextApiResponse } from "next"

interface ResponseData {
  message?: string
  headers?: unknown
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>,
) {
  if (req.method === "GET") {
    const headers = req.headers
    res.status(200).json({ headers })
  } else {
    res.setHeader("Allow", ["GET"])
    res.status(405).json({ message: `Method ${req.method} not allowed` })
  }
}

export { handler as GET, handler as POST }
