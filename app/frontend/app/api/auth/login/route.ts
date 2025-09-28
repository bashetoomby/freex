
import { cookies } from 'next/headers'
import { IAuthInfo } from '@/app/interfaces'
import { jwtDecode } from 'jwt-decode';

export async function POST(req: Request, res: Response) {

    const data: IAuthInfo = await req.json()
    cookies().set('auth-info', JSON.stringify({ ...data, userdata: jwtDecode(data.token) }), { maxAge: 1000 * 60 })
    return Response.json(cookies().get('auth-info'), { status: 201 })
}