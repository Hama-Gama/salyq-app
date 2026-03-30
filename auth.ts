import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'

export const { handlers, signIn, signOut, auth } = NextAuth({
	adapter: PrismaAdapter(prisma),
	providers: [Google],
	pages: {
		signIn: '/ru/login',
	},
	callbacks: {
		// Защита роутов через proxy.ts
		authorized({ auth, request: { nextUrl } }) {
			const isLoggedIn = !!auth?.user
			const isProtected =
				nextUrl.pathname.includes('/dashboard') ||
				nextUrl.pathname.includes('/employees') ||
				nextUrl.pathname.includes('/analytics') ||
				nextUrl.pathname.includes('/calendar') ||
				nextUrl.pathname.includes('/kbk') ||
				nextUrl.pathname.includes('/profile') ||
				nextUrl.pathname.includes('/support') ||
				nextUrl.pathname.includes('/admin')

			if (isProtected && !isLoggedIn) return false
			return true
		},

		// Добавляем userId в сессию
		async session({ session, user }) {
			if (session.user) {
				session.user.id = user.id
			}
			return session
		},
	},
})
