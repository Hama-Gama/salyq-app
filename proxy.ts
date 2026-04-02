import { auth } from '@/auth'
import { NextResponse } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Инициализация Rate Limiter — 60 запросов в минуту
const ratelimit = new Ratelimit({
	redis: Redis.fromEnv(),
	limiter: Ratelimit.slidingWindow(60, '1 m'),
	analytics: true,
	prefix: 'salyq:ratelimit',
})

export default auth(async request => {
	const { pathname } = request.nextUrl

	const requestHeaders = new Headers(request.headers)
	requestHeaders.set('x-pathname', pathname)

	// Rate limiting + ранний возврат для API роутов
	if (pathname.startsWith('/api/')) {
		const ip =
			request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
			request.headers.get('x-real-ip') ??
			'127.0.0.1'

		const { success, limit, remaining } = await ratelimit.limit(`ip:${ip}`)

		if (!success) {
			return NextResponse.json(
				{ error: 'Слишком много запросов. Попробуйте позже.' },
				{
					status: 429,
					headers: {
						'X-RateLimit-Limit': limit.toString(),
						'X-RateLimit-Remaining': '0',
						'Retry-After': '60',
					},
				},
			)
		}

		// ✅ API роуты не трогаем — пропускаем без rewrite
		requestHeaders.set('X-RateLimit-Limit', limit.toString())
		requestHeaders.set('X-RateLimit-Remaining', remaining.toString())
		return NextResponse.next({ request: { headers: requestHeaders } })
	}

	// Языковая маршрутизация — только для страниц
	const defaultLocale = 'ru'
	const secondLocale = 'kz'

	if (
		pathname.startsWith(`/${secondLocale}/`) ||
		pathname === `/${secondLocale}`
	) {
		return NextResponse.next({ request: { headers: requestHeaders } })
	}

	if (
		pathname.startsWith(`/${defaultLocale}/`) ||
		pathname === `/${defaultLocale}`
	) {
		const newPath = pathname.replace(`/${defaultLocale}`, '') || '/'
		request.nextUrl.pathname = `/${defaultLocale}${newPath}`
		return NextResponse.rewrite(request.nextUrl, {
			request: { headers: requestHeaders },
		})
	}

	request.nextUrl.pathname = `/${defaultLocale}${pathname}`
	return NextResponse.rewrite(request.nextUrl, {
		request: { headers: requestHeaders },
	})
})

export const config = {
	matcher: ['/((?!_next/static|_next/image|assets|favicon.ico|sw.js).*)'],
}