export async function GET() {
	const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!
	const WEBHOOK_URL = `${process.env.AUTH_URL}/api/telegram/webhook`

	const res = await fetch(
		`https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`,
		{
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ url: WEBHOOK_URL }),
		},
	)

	const data = await res.json()
	return Response.json(data)
}
