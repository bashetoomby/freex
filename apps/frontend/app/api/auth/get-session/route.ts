
import { cookies } from 'next/headers'
import type { NextApiResponse } from 'next'

export async function GET(req: Request, res: NextApiResponse) {

    const cookie = cookies().get('auth-info')

    return Response.json(cookie)
}