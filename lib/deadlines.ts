import { HOLIDAYS_2026 } from '@/constants/holidays-2026'

// Проверка — является ли дата выходным днём (суббота/воскресенье)
function isWeekend(date: Date): boolean {
	const day = date.getDay()
	return day === 0 || day === 6
}

// Проверка — является ли дата праздничным днём
function isHoliday(date: Date, holidays: string[] = HOLIDAYS_2026): boolean {
	const dateStr = date.toISOString().split('T')[0]
	return holidays.includes(dateStr)
}

// Возвращает ближайший рабочий день (если дата — выходной или праздник)
export function getNextWorkingDay(
	date: Date,
	holidays: string[] = HOLIDAYS_2026,
): Date {
	const result = new Date(date)
	while (isWeekend(result) || isHoliday(result, holidays)) {
		result.setDate(result.getDate() + 1)
	}
	return result
}

// Дедлайн ежемесячных платежей — 25 число с учётом переносов
export function getMonthlyDeadline(year: number, month: number): Date {
	// month: 1-12
	const date = new Date(year, month - 1, 25)
	return getNextWorkingDay(date)
}

// Дедлайны по 910 форме
export function get910Deadlines(year: number) {
	return {
		half1: {
			// 1е полугодие: сдать до 15 августа, оплатить до 25 августа
			submitBy: getNextWorkingDay(new Date(year, 7, 15)), // август = 7
			payBy: getNextWorkingDay(new Date(year, 7, 25)),
		},
		half2: {
			// 2е полугодие: сдать до 15 февраля следующего года
			submitBy: getNextWorkingDay(new Date(year + 1, 1, 15)), // февраль = 1
			payBy: getNextWorkingDay(new Date(year + 1, 1, 25)),
		},
	}
}

// Форматирование даты для отображения (DD.MM.YYYY)
export function formatDeadline(date: Date): string {
	const day = String(date.getDate()).padStart(2, '0')
	const month = String(date.getMonth() + 1).padStart(2, '0')
	const year = date.getFullYear()
	return `${day}.${month}.${year}`
}

// Сколько дней осталось до дедлайна
export function getDaysUntilDeadline(deadline: Date): number {
	const today = new Date()
	today.setHours(0, 0, 0, 0)
	const diff = deadline.getTime() - today.getTime()
	return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

// Статус дедлайна для UI
export type DeadlineStatus = 'safe' | 'warning' | 'urgent' | 'overdue'

export function getDeadlineStatus(deadline: Date): DeadlineStatus {
	const days = getDaysUntilDeadline(deadline)
	if (days < 0) return 'overdue'
	if (days <= 1) return 'urgent'
	if (days <= 3) return 'warning'
	return 'safe'
}

// Экспортируем функции для использования в других частях приложения
export function getMonthlyDeadline(year: number, month: number): Date {
	return new Date(year, month - 1, 25, 23, 59, 59)
}

export function getDaysUntilDeadline(deadline: Date): number {
	const now = new Date()
	const diffTime = deadline.getTime() - now.getTime()
	return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

export function formatDeadline(deadline: Date): string {
	return deadline.toLocaleDateString('ru-RU', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
	})
}

function calculateMonthlyDeadline(): Date {
	const today = new Date()
	const currentMonth = today.getMonth()
	const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1
	const year = today.getFullYear()
	const deadlineDate = new Date(year, nextMonth, 25)
	// If today is past the 25th of the current month, set deadline for next month
	return today.getDate() > 25 ? deadlineDate : new Date(year, currentMonth, 25)
}

function getDaysUntilDeadline(): number {
	const deadline = calculateMonthlyDeadline()
	const today = new Date()
	const timeDiff = deadline.getTime() - today.getTime()
	return Math.ceil(timeDiff / (1000 * 3600 * 24)) // Convert milliseconds to days
}

function formatDeadlineDate(): string {
	const deadline = calculateMonthlyDeadline()
	return deadline.toLocaleDateString('en-KZ', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	})
}