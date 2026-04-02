import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { incomeSchema } from '@/lib/validation'
import { checkIncomeLimit } from '@/lib/calculations'

// GET — история доходов с cursor-based пагинацией
export async function GET(request: Request) {
	const session = await auth()
	if (!session?.user?.id) {
		return Response.json({ error: 'Не авторизован' }, { status: 401 })
	}

	const { searchParams } = new URL(request.url)
	const cursor = searchParams.get('cursor') // ID последней записи
	const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 50)

	// Запрос с пагинацией
	const incomes = await prisma.income.findMany({
		where: { userId: session.user.id },
		orderBy: { date: 'desc' },
		take: limit + 1, // берём на 1 больше чтобы узнать есть ли следующая страница
		...(cursor
			? {
					cursor: { id: cursor },
					skip: 1, // пропускаем сам cursor
				}
			: {}),
	})

	// Определяем есть ли следующая страница
	const hasNextPage = incomes.length > limit
	const items = hasNextPage ? incomes.slice(0, limit) : incomes
	const nextCursor = hasNextPage ? items[items.length - 1].id : null

	// Считаем общий доход за текущий год
	const currentYear = new Date().getFullYear()
	const yearStart = new Date(currentYear, 0, 1)

	const totalResult = await prisma.income.aggregate({
		where: {
			userId: session.user.id,
			date: { gte: yearStart },
		},
		_sum: { amount: true },
	})

	const totalIncome = Number(totalResult._sum.amount ?? 0)
	const limitCheck = checkIncomeLimit(totalIncome)

	return Response.json({
		incomes: items,
		nextCursor,
		hasNextPage,
		totalIncome,
		limitCheck,
	})
}

// POST — добавить доход
export async function POST(request: Request) {
	const session = await auth()
	if (!session?.user?.id) {
		return Response.json({ error: 'Не авторизован' }, { status: 401 })
	}

	const body = await request.json()

	const result = incomeSchema.safeParse(body)
	if (!result.success) {
		return Response.json(
			{ error: 'Ошибка валидации', issues: result.error.issues },
			{ status: 400 },
		)
	}

	const { amount, category, note, date } = result.data

	const income = await prisma.income.create({
		data: {
			userId: session.user.id,
			amount,
			category: category ?? null,
			note: note ?? null,
			date: date ? new Date(date) : new Date(),
		},
	})

	// Проверяем лимит
	const currentYear = new Date().getFullYear()
	const yearStart = new Date(currentYear, 0, 1)

	const totalResult = await prisma.income.aggregate({
		where: {
			userId: session.user.id,
			date: { gte: yearStart },
		},
		_sum: { amount: true },
	})

	const totalIncome = Number(totalResult._sum.amount ?? 0)
	const limitCheck = checkIncomeLimit(totalIncome)

	return Response.json({ income, totalIncome, limitCheck })
}

// DELETE — удалить доход
export async function DELETE(request: Request) {
	const session = await auth()
	if (!session?.user?.id) {
		return Response.json({ error: 'Не авторизован' }, { status: 401 })
	}

	const { searchParams } = new URL(request.url)
	const id = searchParams.get('id')

	if (!id) {
		return Response.json({ error: 'ID не указан' }, { status: 400 })
	}

	const income = await prisma.income.findFirst({
		where: { id, userId: session.user.id },
	})

	if (!income) {
		return Response.json({ error: 'Запись не найдена' }, { status: 404 })
	}

	await prisma.income.delete({ where: { id } })

	return Response.json({ success: true })
}
