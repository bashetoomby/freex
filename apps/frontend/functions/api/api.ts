
import { IAuthInfo } from "@/app/interfaces"
import { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies"

export async function getAuthInfo() {
    const res = await fetch('/api/auth/get-session', {
        method: 'GET'
    })
    const json = await res.json()
    const authInfo: IAuthInfo = JSON.parse(json.value)
    if (res.status === 200) return authInfo
    return null
}
export async function refreshToken() {
    const refreshRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
    })
    if (refreshRes.status === 401) {
        await fetch('/api/auth/logout', {
            method: 'POST'
        })
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
            method: 'POST',
            credentials: 'include',
        })
    }
    if (refreshRes.status === 201) {
        const json: { token: string } = await refreshRes.json()
        const loginRes = await fetch(`/api/auth/login`, {
            method: 'POST',
            credentials: 'include',
            body: JSON.stringify({
                isAuth: true,
                token: json.token
            }),
        })
        return loginRes
    }
    else return null
}


export async function requestWrapper(
    requset: (authInfo: IAuthInfo, body?: any) => Promise<Response>,
    response: (res: Response) => any,
    reject: () => any,
    body?: any
) {
    const authInfo: IAuthInfo | null = await getAuthInfo()
    if (authInfo && authInfo.isAuth && authInfo.token) {
        const res: Response = await requset(authInfo, body)
        if (res.status === 403) {
            const refreshRes: Response | null = await refreshToken()

            if (refreshRes?.status === 201) {
                const json: RequestCookie = await refreshRes.json()
                const refreshAuthInfo = JSON.parse(json?.value || "{}")
                const res: Response = await requset(refreshAuthInfo, body)
                response(res)
                return res

            }
            else reject()
        }
        else {
            response(res)
            return res
        }
    }
}