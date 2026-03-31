import { auth } from '@/auth'
import { NextResponse } from 'next/server'

const locales = ['ru', 'kz']
const defaultLocale = 'ru'

export default auth(req => {
	const { pathname } = req.nextUrl

	// 1. Пропускаем системные файлы и API
	if (
		pathname.startsWith('/api') ||
		pathname.startsWith('/_next') ||
		pathname.includes('.') // файлы типа .png, .ico
	) {
		return NextResponse.next()
	}

	// 2. Проверяем наличие локали в URL
	const pathnameHasLocale = locales.some(
		locale => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
	)

	// 3. Если локали нет — редирект на /ru/...
	if (!pathnameHasLocale) {
		req.nextUrl.pathname = `/${defaultLocale}${pathname}`
		return NextResponse.redirect(req.nextUrl)
	}

	// 4. Передаем pathname в заголовки (понадобится для активных ссылок в Navbar)
	const requestHeaders = new Headers(req.headers)
	requestHeaders.set('x-pathname', pathname)

	return NextResponse.next({
		request: { headers: requestHeaders },
	})
})

export const config = {
	matcher: ['/((?!api|_next/static|_next/image|assets|favicon.ico|sw.js).*)'],
}
