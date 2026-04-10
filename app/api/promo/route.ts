import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import * as z from 'zod'

const promoSchema = z.object({
	code: z.string().min(3).max(50).toUpperCase(),
})

export async function POST(request: Request) {
	const session = await auth()
	if (!session?.user?.id) {
		return Response.json({ error: 'Не авторизован' }, { status: 401 })
	}

	const body = await request.json()
	const result = promoSchema.safeParse(body)

	if (!result.success) {
		return Response.json({ error: 'Неверный промокод' }, { status: 400 })
	}

	const { code } = result.data

	// Ищем промокод
	const promo = await prisma.promoCode.findUnique({
		where: { code },
	})

	if (!promo) {
		return Response.json({ error: 'Промокод не найден' }, { status: 404 })
	}

	if (!promo.isActive) {
		return Response.json({ error: 'Промокод неактивен' }, { status: 400 })
	}

	if (promo.expiresAt && promo.expiresAt < new Date()) {
		return Response.json({ error: 'Промокод истёк' }, { status: 400 })
	}

	if (promo.usedCount >= promo.maxUses) {
		return Response.json({ error: 'Промокод исчерпан' }, { status: 400 })
	}

	// Активируем подписку
	const now = new Date()
	const endDate = new Date(now)
	endDate.setMonth(endDate.getMonth() + promo.months)

	await prisma.$transaction([
		// Обновляем подписку пользователя
		prisma.user.update({
			where: { id: session.user.id },
			data: {
				subscriptionType: 'PRO',
				subscriptionStart: now,
				subscriptionEnd: endDate,
				isManualGrant: true,
				grantNote: `Промокод: ${code}`,
			},
		}),
		// Увеличиваем счётчик использований
		prisma.promoCode.update({
			where: { code },
			data: { usedCount: { increment: 1 } },
		}),
	])

	return Response.json({
		success: true,
		months: promo.months,
		endDate: endDate.toISOString(),
	})
}
