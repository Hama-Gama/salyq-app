// app/api/cron/reminders/route.ts

import { verifySignatureAppRouter } from '@upstash/qstash/nextjs'
import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { sendDeadlineReminder } from '@/lib/telegram'

// Функция расчета дней до 25-го числа
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

	// Уведомляем за неделю, за 3 дня, за день и в день дедлайна
	const notifyDays = [17, 7, 3, 1, 0]

	if (!notifyDays.includes(daysLeft)) {
		return NextResponse.json({
			ok: true,
			message: `Уведомления не требуются. До 25-го числа осталось: ${daysLeft} дн.`,
		})
	}

	const supabase = await createClient()

	// Тянем всех, у кого заполнен tgChatId
	const { data: users, error } = await supabase
		.from('profiles')
		.select('tgChatId, name, language')
		.not('tgChatId', 'is', null)

	if (error) {
		console.error('Supabase error:', error)
		return NextResponse.json({ error: 'Database error' }, { status: 500 })
	}

	if (!users || users.length === 0) {
		return NextResponse.json({
			ok: true,
			message: 'Нет пользователей с привязанным TG',
		})
	}

	let sent = 0
	let failed = 0

	// Красиво форматируем дату для сообщения
	const deadlineDate = new Date()
	deadlineDate.setDate(25)
	if (new Date().getDate() > 25)
		deadlineDate.setMonth(deadlineDate.getMonth() + 1)

	const deadlineStr = deadlineDate.toLocaleDateString('ru-RU', {
		day: 'numeric',
		month: 'long',
	})

	// Рассылка
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

	console.log(`[Cron] Рассылка завершена. Успешно: ${sent}, Ошибок: ${failed}`)

	return NextResponse.json({
		ok: true,
		sent,
		failed,
		daysLeft,
		deadline: deadlineStr,
	})
}

// Защита роута от посторонних вызовов через Upstash Signature
export const POST = verifySignatureAppRouter(handler)
