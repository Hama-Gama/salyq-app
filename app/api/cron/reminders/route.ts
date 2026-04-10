// app/api/cron/reminders/route.ts

import { verifySignatureAppRouter } from '@upstash/qstash/nextjs'
import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { sendDeadlineReminder } from '@/lib/telegram'

// Расчет дней до 25-го числа
function getDaysUntilDeadline() {
	const now = new Date()
	const year = now.getFullYear()
	const month = now.getMonth()
	const deadline = new Date(year, month, 25)

	if (now > deadline) {
		deadline.setMonth(deadline.getMonth() + 1)
	}

	const diffTime = deadline.getTime() - now.getTime()
	return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

async function handler() {
	const daysLeft = getDaysUntilDeadline()

	// Тестовое: сегодня 8 апреля, до 25-го осталось 17 дней.
	// Добавь 17 в массив ниже, если хочешь проверить ПРЯМО СЕЙЧАС.
	const notifyDays = [14, 7, 3, 1, 0]

	if (!notifyDays.includes(daysLeft)) {
		return NextResponse.json({
			ok: true,
			message: `Сегодня без уведомлений. Дней до дедлайна: ${daysLeft}`,
		})
	}

	const supabase = await createClient()

	const { data: users, error } = await supabase
		.from('profiles')
		.select('tgChatId, name, language')
		.not('tgChatId', 'is', null)

	if (error) {
		console.error('Supabase error:', error)
		return NextResponse.json({ error: 'Database error' }, { status: 500 })
	}

	if (!users || users.length === 0) {
		return NextResponse.json({ ok: true, message: 'Нет пользователей' })
	}

	let sent = 0
	let failed = 0

	// Форматируем дату для сообщения (например, "25 апреля")
	const deadlineDate = new Date()
	deadlineDate.setDate(25)
	if (new Date().getDate() > 25)
		deadlineDate.setMonth(deadlineDate.getMonth() + 1)
	const deadlineStr = deadlineDate.toLocaleDateString('ru-RU', {
		day: 'numeric',
		month: 'long',
	})

	for (const user of users) {
		if (!user.tgChatId) continue

		const lang = (user.language === 'kz' ? 'kz' : 'ru') as 'ru' | 'kz'

		const success = await sendDeadlineReminder(
			user.tgChatId,
			daysLeft,
			deadlineStr,
			lang,
		)

		if (success) sent++
		else failed++
	}

	return NextResponse.json({
		ok: true,
		sent,
		failed,
		daysLeft,
		deadline: deadlineStr,
	})
}

export const POST = verifySignatureAppRouter(handler)
