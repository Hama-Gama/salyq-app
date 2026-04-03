'use client'

import { useState, useEffect } from 'react'
import { FileDown } from 'lucide-react'
import type { Locale } from '@/types'
import { calculateIncomeTax, calculateSelfPayments } from '@/lib/calculations'

interface Props {
	lang: Locale
	totalIncome: number
	period: string
	userName?: string
	buttonLabel: string
	loadingLabel: string
}

export default function PDFDownloadButton({
	lang,
	totalIncome,
	period,
	userName,
	buttonLabel,
	loadingLabel,
}: Props) {
	const [mounted, setMounted] = useState(false)
	const [PDFComponents, setPDFComponents] = useState<any>(null)

	useEffect(() => {
		// Загружаем PDF библиотеку только на клиенте
		Promise.all([
			import('@react-pdf/renderer'),
			import('./MonthlyReportPDF'),
		]).then(([pdfLib, reportModule]) => {
			setPDFComponents({
				PDFDownloadLink: pdfLib.PDFDownloadLink,
				MonthlyReportPDF: reportModule.default,
			})
			setMounted(true)
		})
	}, [])

	if (!mounted || !PDFComponents) {
		return (
			<button
				disabled
				className='flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg text-base font-medium opacity-50 cursor-not-allowed'
			>
				<FileDown className='w-5 h-5' />
				{loadingLabel}
			</button>
		)
	}

	const { PDFDownloadLink, MonthlyReportPDF } = PDFComponents

	const taxResult = calculateIncomeTax(totalIncome)
	const selfPayments = calculateSelfPayments(85_000)

	const generatedAt = new Date().toLocaleDateString('ru-RU', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
	})

	const fileName = `salyq-report-${period.replace(/\s/g, '-')}.pdf`

	return (
		<PDFDownloadLink
			document={
				<MonthlyReportPDF
					lang={lang}
					period={period}
					totalIncome={totalIncome}
					taxAmount={taxResult.safeTax}
					selfPayments={selfPayments}
					userName={userName}
					generatedAt={generatedAt}
				/>
			}
			fileName={fileName}
		>
			{({ loading }: { loading: boolean }) => (
				<button
					className='flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg text-base font-medium hover:bg-primary/90 transition-colors disabled:opacity-50'
					disabled={loading}
				>
					<FileDown className='w-5 h-5' />
					{loading ? loadingLabel : buttonLabel}
				</button>
			)}
		</PDFDownloadLink>
	)
}
