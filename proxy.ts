import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const defaultLocale = 'ru'
const secondLocale = 'kz'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // /kz/* — оставляем как есть
  if (pathname.startsWith(`/${secondLocale}/`) || pathname === `/${secondLocale}`) {
    return NextResponse.next()
  }

  // /ru/* — rewrite убираем /ru из URL (salyq-app.kz/ru/dashboard → salyq-app.kz/dashboard)
  if (pathname.startsWith(`/${defaultLocale}/`) || pathname === `/${defaultLocale}`) {
    const newPath = pathname.replace(`/${defaultLocale}`, '') || '/'
    request.nextUrl.pathname = `/${defaultLocale}${newPath}`
    return NextResponse.rewrite(request.nextUrl)
  }

  // Всё остальное — rewrite на /ru/* (русский по умолчанию без редиректа)
  request.nextUrl.pathname = `/${defaultLocale}${pathname}`
  return NextResponse.rewrite(request.nextUrl)
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|assets|favicon.ico|sw.js).*)'],
}
