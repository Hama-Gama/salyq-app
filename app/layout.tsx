import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
	title: 'SalyqApp — Налоговый помощник для ИП Казахстана',
	description:
		'Автоматический расчёт налогов и соцплатежей для ИП на упрощённой декларации',
}

export default function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<html suppressHydrationWarning>
			<body>{children}</body>
		</html>
	)
}
