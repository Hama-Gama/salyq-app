const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`

export async function sendTelegramMessage(
	chatId: string,
	text: string,
): Promise<boolean> {
	try {
		const res = await fetch(`${TELEGRAM_API}/sendMessage`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				chat_id: chatId,
				text,
				parse_mode: 'HTML',
			}),
		})
		return res.ok
	} catch {
		return false
	}
}

export async function sendDeadlineReminder(
	chatId: string,
	daysLeft: number,
	deadlineDate: string,
	amount: number,
	lang: 'ru' | 'kz' = 'ru',
): Promise<boolean> {
	const isRu = lang === 'ru'

	const emoji = daysLeft <= 1 ? '🚨' : daysLeft <= 3 ? '⚠️' : '⏰'

	const text = isRu
		? `${emoji} <b>Напоминание о платеже</b>\n\n` +
			`📅 Срок: <b>${deadlineDate}</b>\n` +
			`⏳ Осталось: <b>${daysLeft} дн.</b>\n` +
			`💰 Сумма: <b>${amount.toLocaleString('ru-RU')} ₸</b>\n\n` +
			`👉 salyq-app.vercel.app`
		: `${emoji} <b>Төлем туралы еске салу</b>\n\n` +
			`📅 Мерзім: <b>${deadlineDate}</b>\n` +
			`⏳ Қалды: <b>${daysLeft} күн</b>\n` +
			`💰 Сома: <b>${amount.toLocaleString('ru-RU')} ₸</b>\n\n` +
			`👉 salyq-app.vercel.app`

	return sendTelegramMessage(chatId, text)
}
