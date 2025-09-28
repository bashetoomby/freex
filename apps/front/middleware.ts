import { NextRequest, NextResponse } from "next/server";
import { cookies } from 'next/headers'
import { IAuthInfo } from "./app/interfaces";

export async function middleware(req: NextRequest) {

    let res = NextResponse.next()

    const cookieStore = cookies()
    let authInfo: IAuthInfo = JSON.parse(cookieStore.get('auth-info')?.value || '{}')
    const { pathname } = req.nextUrl


    if (pathname === '/auth/login' && authInfo?.isAuth) {
        return NextResponse.redirect(new URL("/spin", req.url))
    }
    if (pathname === '/auth/registration' && authInfo?.isAuth) {
        return NextResponse.redirect(new URL("/spin", req.url))
    }
    if (pathname !== '/auth/login' && !authInfo.isAuth) {
        if (pathname !== '/auth/registration') {
            return NextResponse.redirect(new URL("/auth/login", req.url))
        }
    }
    if (authInfo.isAuth && !authInfo?.userdata?.fullfield && pathname !== '/profile' && pathname !== '/settings') {
        const url = new URL('/profile', req.url)
        url.searchParams.set('notification', 'To continue, please fill in all required fields.')
        return NextResponse.redirect(url)
    }
    if (pathname === '/') {
        return NextResponse.redirect(new URL("/spin", req.url))
    }
    return res
}

export const config = {
    matcher: ['/auth/login', '/auth/registration', '/spin', '/chats', '/profile', '/settings','/'],
}