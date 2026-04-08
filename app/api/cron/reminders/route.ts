import { verifySignatureAppRouter } from '@upstash/qstash/nextjs'
import { prisma } from '@/lib/prisma'
import { sendDeadlineReminder } from '@/lib/telegram'
import {
	getMonthlyDeadline,
	getDaysUntilDeadline,
	formatDeadline,
} from '@/lib/deadlines'
import { calculateSelfPayments } from '@/lib/calculations'

async function handler() {
	const now = new Date()
	const currentMonth = now.getMonth() + 1
	const currentYear = now.getFullYear()

	// Получаем ближайший дедлайн
	const deadline = getMonthlyDeadline(currentYear, currentMonth)
	const daysLeft = getDaysUntilDeadline(deadline)
	const deadlineStr = formatDeadline(deadline)

	// Отправляем только за 7, 3, 1 день и в день дедлайна
	const notifyDays = [7, 3, 1, 0]
	if (!notifyDays.includes(daysLeft)) {
		return Response.json({
			ok: true,
			message: `No reminders today. Days left: ${daysLeft}`,
		})
	}

	// Получаем всех пользователей с tgChatId
	const users = await prisma.user.findMany({
		where: {
			tgChatId: { not: null },
		},
		select: {
			id: true,
			tgChatId: true,
			language: true,
		},
	})

	const selfPayments = calculateSelfPayments(85_000)
	let sent = 0
	let failed = 0

	for (const user of users) {
		if (!user.tgChatId) continue

		const lang = (user.language === 'kz' ? 'kz' : 'ru') as 'ru' | 'kz'

		const success = await sendDeadlineReminder(
			user.tgChatId,
			daysLeft,
			deadlineStr,
			selfPayments.total,
			lang,
		)

		if (success) sent++
		else failed++
	}

	console.log(
		`Reminders sent: ${sent}, failed: ${failed}, days left: ${daysLeft}`,
	)

	return Response.json({
		ok: true,
		sent,
		failed,
		daysLeft,
		deadline: deadlineStr,
	})
}

// Верифицируем подпись QStash
export const POST = verifySignatureAppRouter(handler)
