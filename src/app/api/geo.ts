import type { NextApiRequest, NextApiResponse } from 'next';
import {headers} from "next/headers";

interface ResponseData {
    message: string;
}

export default function handler(
    req: NextApiRequest,
    res: NextApiResponse<ResponseData>
) {
    const headersList = headers()
    const city = headersList.get('X-Vercel-IP-City') ?? "unknown"
    if (req.method === 'GET') {
        res.status(200).json({ message: `hello ${city}` });
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).json({ message: `Method ${req.method} not allowed` });
    }
}