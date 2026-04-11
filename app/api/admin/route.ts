import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import * as z from 'zod'

// Проверка что пользователь — админ
async function isAdmin(userId: string): Promise<boolean> {
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: { email: true },
	})
	return user?.email === process.env.ADMIN_EMAIL
}

// GET — статистика и данные для админа
export async function GET(request: Request) {
	const session = await auth()
	if (!session?.user?.id) {
		return Response.json({ error: 'Не авторизован' }, { status: 401 })
	}

	if (!(await isAdmin(session.user.id))) {
		return Response.json({ error: 'Нет доступа' }, { status: 403 })
	}

	const { searchParams } = new URL(request.url)
	const tab = searchParams.get('tab') ?? 'stats'

	if (tab === 'stats') {
		const [totalUsers, proUsers, totalIncomes, openTickets, recentUsers] =
			await Promise.all([
				prisma.user.count(),
				prisma.user.count({ where: { subscriptionType: 'PRO' } }),
				prisma.income.aggregate({ _sum: { amount: true } }),
				prisma.supportTicket.count({ where: { status: 'OPEN' } }),
				prisma.user.findMany({
					orderBy: { createdAt: 'desc' },
					take: 10,
					select: {
						id: true,
						name: true,
						email: true,
						subscriptionType: true,
						createdAt: true,
					},
				}),
			])

		return Response.json({
			stats: {
				totalUsers,
				proUsers,
				freeUsers: totalUsers - proUsers,
				totalIncomes: Number(totalIncomes._sum.amount ?? 0),
				openTickets,
			},
			recentUsers,
		})
	}

	if (tab === 'users') {
		const users = await prisma.user.findMany({
			orderBy: { createdAt: 'desc' },
			select: {
				id: true,
				name: true,
				email: true,
				subscriptionType: true,
				subscriptionEnd: true,
				createdAt: true,
				tgChatId: true,
			},
		})
		return Response.json({ users })
	}

	if (tab === 'tickets') {
		const tickets = await prisma.supportTicket.findMany({
			orderBy: { createdAt: 'desc' },
			include: {
				user: {
					select: { name: true, email: true },
				},
			},
		})
		return Response.json({ tickets })
	}

	if (tab === 'promos') {
		const promos = await prisma.promoCode.findMany({
			orderBy: { createdAt: 'desc' },
		})
		return Response.json({ promos })
	}

	return Response.json({ error: 'Неверный tab' }, { status: 400 })
}

// POST — создать промокод или выдать грант
export async function POST(request: Request) {
	const session = await auth()
	if (!session?.user?.id) {
		return Response.json({ error: 'Не авторизован' }, { status: 401 })
	}

	if (!(await isAdmin(session.user.id))) {
		return Response.json({ error: 'Нет доступа' }, { status: 403 })
	}

	const body = await request.json()
	const { action } = body

	if (action === 'create_promo') {
		const schema = z.object({
			code: z.string().min(3).max(50).toUpperCase(),
			months: z.number().min(1).max(24),
			maxUses: z.number().min(1).max(10000),
			expiresAt: z.string().optional(),
		})

		const result = schema.safeParse(body)
		if (!result.success) {
			return Response.json({ error: 'Ошибка валидации' }, { status: 400 })
		}

		const { code, months, maxUses, expiresAt } = result.data

		const promo = await prisma.promoCode.create({
			data: {
				code,
				months,
				maxUses,
				expiresAt: expiresAt ? new Date(expiresAt) : null,
			},
		})

		return Response.json({ promo })
	}

	if (action === 'grant_access') {
		const schema = z.object({
			userId: z.string(),
			months: z.number().min(1).max(24),
			note: z.string().optional(),
		})

		const result = schema.safeParse(body)
		if (!result.success) {
			return Response.json({ error: 'Ошибка валидации' }, { status: 400 })
		}

		const { userId, months, note } = result.data

		const now = new Date()
		const endDate = new Date(now)
		endDate.setMonth(endDate.getMonth() + months)

		const user = await prisma.user.update({
			where: { id: userId },
			data: {
				subscriptionType: 'PRO',
				subscriptionStart: now,
				subscriptionEnd: endDate,
				isManualGrant: true,
				grantNote: note ?? `Ручной грант на ${months} мес.`,
			},
		})

		return Response.json({ user })
	}

	if (action === 'close_ticket') {
		const { ticketId } = body
		await prisma.supportTicket.update({
			where: { id: ticketId },
			data: { status: 'CLOSED' },
		})
		return Response.json({ success: true })
	}

	return Response.json({ error: 'Неверный action' }, { status: 400 })
}
