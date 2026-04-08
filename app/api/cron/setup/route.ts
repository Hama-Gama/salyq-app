import { Client } from '@upstash/qstash'

export async function GET() {
	const client = new Client({
		token: process.env.QSTASH_TOKEN!,
	})

	// Каждый день в 9:00 UTC+5 (Алматы) = 4:00 UTC
	const schedule = await client.schedules.create({
		destination: `${process.env.AUTH_URL}/api/cron/reminders`,
		cron: '0 4 * * *',
	})

	return Response.json({
		ok: true,
		scheduleId: schedule.scheduleId,
		message: 'Cron job created: daily at 09:00 Almaty time',
	})
}
