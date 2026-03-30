import { auth } from '@/auth'
import { NextResponse } from 'next/server'

const defaultLocale = 'ru'
const secondLocale = 'kz'

export default auth(request => {
	const { pathname } = request.nextUrl

	// /kz/* — оставляем как есть
	if (
		pathname.startsWith(`/${secondLocale}/`) ||
		pathname === `/${secondLocale}`
	) {
		return NextResponse.next()
	}

	// /ru/* — убираем /ru из URL
	if (
		pathname.startsWith(`/${defaultLocale}/`) ||
		pathname === `/${defaultLocale}`
	) {
		const newPath = pathname.replace(`/${defaultLocale}`, '') || '/'
		request.nextUrl.pathname = `/${defaultLocale}${newPath}`
		return NextResponse.rewrite(request.nextUrl)
	}

	// Всё остальное — rewrite на /ru/*
	request.nextUrl.pathname = `/${defaultLocale}${pathname}`
	return NextResponse.rewrite(request.nextUrl)
})

export const config = {
	matcher: ['/((?!api|_next/static|_next/image|assets|favicon.ico|sw.js).*)'],
}
