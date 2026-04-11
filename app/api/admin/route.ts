import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import * as z from 'zod'

async function isAdmin(userId: string): Promise<boolean> {
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: { email: true },
	})
	// Сравнение с переменной окружения
	return user?.email === process.env.ADMIN_EMAIL
}

export async function GET(request: Request) {
	const session = await auth()

	if (!session?.user?.id || !(await isAdmin(session.user.id))) {
		return Response.json({ error: 'Forbidden' }, { status: 403 })
	}

	const { searchParams } = new URL(request.url)
	const tab = searchParams.get('tab') ?? 'stats'

	try {
		if (tab === 'stats') {
			const [totalUsers, proUsers, totalIncomes, openTickets] =
				await Promise.all([
					prisma.user.count(),
					prisma.user.count({ where: { subscriptionType: 'PRO' } }),
					prisma.income.aggregate({ _sum: { amount: true } }),
					prisma.supportTicket.count({ where: { status: 'OPEN' } }),
				])
			return Response.json({
				stats: {
					totalUsers,
					proUsers,
					freeUsers: totalUsers - proUsers,
					totalIncomes: Number(totalIncomes._sum.amount ?? 0),
					openTickets,
				},
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
				},
			})
			return Response.json({ users })
		}

		if (tab === 'promos') {
			const promos = await prisma.promoCode.findMany({
				orderBy: { createdAt: 'desc' },
			})
			return Response.json({ promos })
		}

		return Response.json({ error: 'Invalid tab' }, { status: 400 })
	} catch (error) {
		return Response.json({ error: 'Database error' }, { status: 500 })
	}
}

export async function POST(request: Request) {
	const session = await auth()
	if (!session?.user?.id || !(await isAdmin(session.user.id))) {
		return Response.json({ error: 'Forbidden' }, { status: 403 })
	}

	try {
		const body = await request.json()
		const { action } = body

		if (action === 'create_promo') {
			const schema = z.object({
				code: z.string().min(3).toUpperCase(),
				months: z.number().min(1),
				maxUses: z.number().min(1),
			})

			// ОЧИСТКА: Удаляем action, чтобы Zod не выдал ошибку валидации
			const { action: _, ...promoData } = body
			const result = schema.safeParse(promoData)

			if (!result.success) {
				return Response.json({ error: 'Invalid data format' }, { status: 400 })
			}

			const promo = await prisma.promoCode.create({ data: result.data })
			return Response.json({ promo })
		}

		if (action === 'grant_access') {
			const { userId, months } = body
			const user = await prisma.user.findUnique({ where: { id: userId } })
			if (!user)
				return Response.json({ error: 'User not found' }, { status: 404 })

			const baseDate =
				user.subscriptionEnd && user.subscriptionEnd > new Date()
					? new Date(user.subscriptionEnd)
					: new Date()

			const newEnd = new Date(baseDate)
			newEnd.setMonth(newEnd.getMonth() + Number(months))

			await prisma.user.update({
				where: { id: userId },
				data: {
					subscriptionType: 'PRO',
					subscriptionEnd: newEnd,
					isManualGrant: true,
				},
			})
			return Response.json({ success: true })
		}

		return Response.json({ error: 'Unknown action' }, { status: 400 })
	} catch (error) {
		return Response.json({ error: 'Execution error' }, { status: 500 })
	}
}