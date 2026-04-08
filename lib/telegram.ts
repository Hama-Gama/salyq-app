import axios from 'axios'
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





// lib/telegram.ts
export async function sendDeadlineReminder(
  chatId: string,
  daysLeft: number,
  deadline: string,
  amount: number,
  lang: 'ru' | 'kz'
): Promise<boolean> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  if (!botToken) return false

  const messages = {
    ru: {
      0: `🚨 СЕГОДНЯ! Последний день оплаты налогов! Дедлайн: ${deadline}`,
      1: `📅 Завтра последний день! До дедлайна: ${deadline}`,
      3: `⏰ Внимание! До дедлайна осталось 3 дня: ${deadline}`,
      7: `📢 Напоминание: До дедлайна по налогам осталось 7 дней: ${deadline}`,
    },
    kz: {
      0: `🚨 БҮГІН! Салық төлеудің соңғы күні! Дедлайн: ${deadline}`,
      1: `📅 Ертең соңғы күн! Дедлайнына: ${deadline}`,
      3: `⏰ Назар аударыңыз! Дедлайнына 3 күн қалды: ${deadline}`,
      7: `📢 Ескерткіш: Салық дедлайнына 7 күн қалды: ${deadline}`,
    },
  }

  try {
    const res = await axios.post(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        chat_id: chatId,
        text: messages[lang][daysLeft as keyof typeof messages['ru']],
        parse_mode: 'HTML',
      }
    )
    return res.status === 200
  } catch (error) {
    console.error('Telegram error:', error)
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

  // Выбираем сообщение по языку и количеству дней
  const currentLangMessages = messages[lang] || messages['ru']
  const text = currentLangMessages[daysLeft as keyof typeof currentLangMessages]

  if (!text) return false // Если пришло не 0, 1, 3 или 7 дней

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