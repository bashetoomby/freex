
import { cookies } from 'next/headers'
import type { NextApiRequest, NextApiResponse } from 'next'

export async function POST(req: Request, res: NextApiResponse) {

    cookies().delete('auth-info')
  
    
    return new Response("Deleted", {
        status: 200,
    })
}