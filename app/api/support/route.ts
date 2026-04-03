import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import * as z from 'zod'

const supportSchema = z.object({
	type: z.enum(['BUG', 'FEATURE', 'TAX_HELP']),
	subject: z.string().min(3).max(200),
	message: z.string().min(10).max(2000),
})

export async function POST(request: Request) {
	const session = await auth()
	if (!session?.user?.id) {
		return Response.json({ error: 'Не авторизован' }, { status: 401 })
	}

	const body = await request.json()

	const result = supportSchema.safeParse(body)
	if (!result.success) {
		return Response.json(
			{ error: 'Ошибка валидации', issues: result.error.issues },
			{ status: 400 },
		)
	}

	const { type, subject, message } = result.data

	const ticket = await prisma.supportTicket.create({
		data: {
			userId: session.user.id,
			type,
			subject,
			message,
		},
	})

	return Response.json({ ticket })
}

export async function GET() {
	const session = await auth()
	if (!session?.user?.id) {
		return Response.json({ error: 'Не авторизован' }, { status: 401 })
	}

	const tickets = await prisma.supportTicket.findMany({
		where: { userId: session.user.id },
		orderBy: { createdAt: 'desc' },
	})

	return Response.json({ tickets })
}
