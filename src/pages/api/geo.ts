import type { NextApiRequest, NextApiResponse } from 'next';

interface ResponseData {
    message: string;
}

export default function handler(
    req: NextApiRequest,
    res: NextApiResponse<ResponseData>
) {
    if (req.method === 'GET') {
        const city = req.headers["X-Vercel-IP-City"] ?? "unknown";
        res.status(200).json({ message: `Hello ${city as string}` });
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).json({ message: `Method ${req.method} not allowed` });
    }
}

export { handler as GET, handler as POST };
