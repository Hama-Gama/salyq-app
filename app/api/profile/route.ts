import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { profileSchema } from '@/lib/validation'

// GET — получить профиль
export async function GET() {
	const session = await auth()
	if (!session?.user?.id) {
		return Response.json({ error: 'Не авторизован' }, { status: 401 })
	}

	const user = await prisma.user.findUnique({
		where: { id: session.user.id },
		select: {
			id: true,
			name: true,
			email: true,
			image: true,
			iin: true,
			language: true,
			tgChatId: true,
			subscriptionType: true,
			subscriptionEnd: true,
			createdAt: true,
		},
	})

	if (!user) {
		return Response.json({ error: 'Пользователь не найден' }, { status: 404 })
	}

	// Маскируем ИИН без дешифровки
	const maskedIIN = user.iin
		? user.iin.slice(0, 3) + '******' + user.iin.slice(-3)
		: null

	return Response.json({ ...user, iin: maskedIIN })
}

// PATCH — обновить профиль
export async function PATCH(request: Request) {
	const session = await auth()
	if (!session?.user?.id) {
		return Response.json({ error: 'Не авторизован' }, { status: 401 })
	}

	const body = await request.json()

	const result = profileSchema.safeParse(body)
	if (!result.success) {
		return Response.json(
			{ error: 'Ошибка валидации', issues: result.error.issues },
			{ status: 400 },
		)
	}

	const { name, iin, language, tgChatId } = result.data

	const user = await prisma.user.update({
		where: { id: session.user.id },
		data: {
			...(name !== undefined && { name }),
			...(iin !== undefined && { iin }), // пока без шифрования
			...(language !== undefined && { language }),
			...(tgChatId !== undefined && { tgChatId }),
		},
		select: {
			id: true,
			name: true,
			email: true,
			language: true,
			tgChatId: true,
		},
	})

	return Response.json({ user })
}
