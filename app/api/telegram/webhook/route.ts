import { prisma } from '@/lib/prisma'
import { calculateSelfPayments, calculateIncomeTax } from '@/lib/calculations'
import {
	getMonthlyDeadline,
	getDaysUntilDeadline,
	formatDeadline,
} from '@/lib/deadlines'

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`

async function sendMessage(chatId: number | string, text: string) {
	await fetch(`${TELEGRAM_API}/sendMessage`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			chat_id: chatId,
			text,
			parse_mode: 'HTML',
		}),
	})
}

export async function POST(request: Request) {
	try {
		const body = await request.json()
		const message = body.message

		if (!message) return Response.json({ ok: true })

		const chatId = message.chat.id
		const text = message.text ?? ''
		const firstName = message.from?.first_name ?? 'пользователь'

		// Команда /start
		if (text.startsWith('/start')) {
			const parts = text.split(' ')
			const userId = parts[1] // /start userId

			if (userId) {
				// Привязываем tgChatId к пользователю
				await prisma.user.updateMany({
					where: { id: userId },
					data: { tgChatId: String(chatId) },
				})

				await sendMessage(
					chatId,
					`✅ <b>SalyqApp подключён!</b>\n\n` +
						`Привет, ${firstName}! Теперь я буду напоминать тебе о налоговых дедлайнах.\n\n` +
						`Доступные команды:\n` +
						`/status — текущий статус платежей\n` +
						`/deadline — ближайший дедлайн\n` +
						`/help — справка`,
				)
			} else {
				await sendMessage(
					chatId,
					`👋 Привет, ${firstName}!\n\n` +
						`Я <b>SalyqApp Bot</b> — помогаю ИП Казахстана не пропускать налоговые платежи.\n\n` +
						`Чтобы привязать бота к своему аккаунту, зайди в приложение:\n` +
						`👉 salyq-app.vercel.app\n\n` +
						`Профиль → Telegram Chat ID → введи свой ID: <code>${chatId}</code>`,
				)
			}
			return Response.json({ ok: true })
		}

		// Команда /myid
		if (text === '/myid') {
			await sendMessage(
				chatId,
				`Твой Telegram Chat ID:\n<code>${chatId}</code>\n\n` +
					`Скопируй и вставь в профиле SalyqApp.`,
			)
			return Response.json({ ok: true })
		}

		// Команда /deadline
		if (text === '/deadline') {
			const user = await prisma.user.findFirst({
				where: { tgChatId: String(chatId) },
			})

			if (!user) {
				await sendMessage(
					chatId,
					`❌ Аккаунт не привязан.\n\nВведи свой Chat ID (<code>${chatId}</code>) в профиле SalyqApp.`,
				)
				return Response.json({ ok: true })
			}

			const now = new Date()
			const deadline = getMonthlyDeadline(now.getFullYear(), now.getMonth() + 1)
			const days = getDaysUntilDeadline(deadline)
			const selfPayments = calculateSelfPayments(85_000)

			const emoji =
				days <= 1 ? '🚨' : days <= 3 ? '⚠️' : days <= 7 ? '⏰' : '📅'

			await sendMessage(
				chatId,
				`${emoji} <b>Ближайший дедлайн</b>\n\n` +
					`📅 Дата: <b>${formatDeadline(deadline)}</b>\n` +
					`⏳ Осталось: <b>${days} дней</b>\n\n` +
					`💰 Сумма к уплате:\n` +
					`• ОПВ: ${selfPayments.opv.toLocaleString('ru-RU')} ₸\n` +
					`• ОПВР: ${selfPayments.opvr.toLocaleString('ru-RU')} ₸\n` +
					`• ВОСМС: ${selfPayments.vosms.toLocaleString('ru-RU')} ₸\n` +
					`• СО: ${selfPayments.so.toLocaleString('ru-RU')} ₸\n` +
					`━━━━━━━━━━━━\n` +
					`• Итого: <b>${selfPayments.total.toLocaleString('ru-RU')} ₸</b>`,
			)
			return Response.json({ ok: true })
		}

		// Команда /status
		if (text === '/status') {
			const user = await prisma.user.findFirst({
				where: { tgChatId: String(chatId) },
				include: {
					incomes: {
						where: {
							date: {
								gte: new Date(new Date().getFullYear(), 0, 1),
							},
						},
					},
				},
			})

			if (!user) {
				await sendMessage(
					chatId,
					`❌ Аккаунт не привязан.\n\nВведи свой Chat ID (<code>${chatId}</code>) в профиле SalyqApp.`,
				)
				return Response.json({ ok: true })
			}

			const totalIncome = user.incomes.reduce(
				(sum, inc) => sum + Number(inc.amount),
				0,
			)
			const taxResult = calculateIncomeTax(totalIncome)
			const limitPercent = ((totalIncome / 2_595_000_000) * 100).toFixed(1)

			await sendMessage(
				chatId,
				`📊 <b>Статус за ${new Date().getFullYear()} год</b>\n\n` +
					`💵 Доход: <b>${totalIncome.toLocaleString('ru-RU')} ₸</b>\n` +
					`🏛 Налог 4%: <b>${taxResult.safeTax.toLocaleString('ru-RU')} ₸</b>\n` +
					`📈 Использовано лимита: <b>${limitPercent}%</b>\n\n` +
					`👉 Подробнее: salyq-app.vercel.app`,
			)
			return Response.json({ ok: true })
		}

		// Команда /help
		if (text === '/help') {
			await sendMessage(
				chatId,
				`🤖 <b>SalyqApp Bot — справка</b>\n\n` +
					`/start — начало работы\n` +
					`/myid — узнать свой Chat ID\n` +
					`/deadline — ближайший дедлайн\n` +
					`/status — статус за год\n` +
					`/help — эта справка\n\n` +
					`💡 Приложение: salyq-app.vercel.app`,
			)
			return Response.json({ ok: true })
		}

		// Неизвестная команда
		await sendMessage(
			chatId,
			`Неизвестная команда. Напиши /help для списка команд.`,
		)

		return Response.json({ ok: true })
	} catch (error) {
		console.error('Telegram webhook error:', error)
		return Response.json({ ok: true })
	}
}
