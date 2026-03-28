import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Список поддерживаемых языков
const locales = ['ru', 'kz']
const defaultLocale = 'ru'

export function proxy(request: NextRequest) {
	const { pathname } = request.nextUrl

	// 1. Проверяем, есть ли уже локаль в пути (например, /ru/dashboard или /kz/dashboard)
	const pathnameHasLocale = locales.some(
		locale => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
	)

	if (pathnameHasLocale) return NextResponse.next()

	// 2. Если локали нет в пути (например, просто /dashboard), делаем редирект на RU
	request.nextUrl.pathname = `/${defaultLocale}${pathname}`

	// Важно: используем rewrite, если хотим сохранить чистый URL,
	// или redirect, если хотим явного переключения в строке браузера
	return NextResponse.redirect(request.nextUrl)
}

export const config = {
	// Исключаем системные файлы, картинки и API из обработки прокси
	matcher: ['/((?!api|_next/static|_next/image|assets|favicon.ico|sw.js).*)'],
}
