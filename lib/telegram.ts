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



// lib/telegram.ts
export async function sendDeadlineReminder(
  chatId: string,
  daysLeft: number,
  deadline: string,
  lang: 'ru' | 'kz' = 'ru'
): Promise<boolean> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  if (!botToken) {
    console.error('TELEGRAM_BOT_TOKEN is missing')
    return false
  }

  const messages = {
    ru: {
      0: `🚨 <b>СЕГОДНЯ!</b> Последний день оплаты налогов!\nДедлайн: <b>${deadline}</b>`,
      1: `📅 <b>Завтра последний день!</b>\nДо дедлайна: <b>${deadline}</b>`,
      3: `⏰ <b>Внимание!</b> До дедлайна осталось 3 дня:\nСрок: <b>${deadline}</b>`,
      7: `📢 <b>Напоминание:</b> До дедлайна осталось 7 дней:\nСрок: <b>${deadline}</b>`,
    },
    kz: {
      0: `🚨 <b>БҮГІН!</b> Салық төлеудің соңғы күні!\nМерзімі: <b>${deadline}</b>`,
      1: `📅 <b>Ертең соңғы күн!</b>\nДедлайнға дейін: <b>${deadline}</b>`,
      3: `⏰ <b>Назар аударыңыз!</b> 3 күн қалды:\nМерзімі: <b>${deadline}</b>`,
      7: `📢 <b>Ескерткіш:</b> Салық дедлайнына 7 күн қалды:\nМерзімі: <b>${deadline}</b>`,
    },
  }

  const currentLangMessages = messages[lang] || messages['ru']
  const text = currentLangMessages[daysLeft as keyof typeof currentLangMessages]

  if (!text) return false

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: text,
          parse_mode: 'HTML',
        }),
      }
    )
    return res.ok
  } catch (error) {
    console.error('Telegram error:', error)
    return false
  }
}