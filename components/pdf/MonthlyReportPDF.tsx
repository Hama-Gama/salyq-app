import {
	Document,
	Page,
	Text,
	View,
	StyleSheet,
	Font,
} from '@react-pdf/renderer'
import type { Locale } from '@/types'

// Регистрация шрифтов с поддержкой кириллицы и казахских символов
Font.register({
	family: 'Roboto',
	fonts: [
		{ src: '/fonts/Roboto-Regular.ttf', fontWeight: 400 },
		{ src: '/fonts/Roboto-Bold.ttf', fontWeight: 700 },
	],
})

const styles = StyleSheet.create({
	page: {
		fontFamily: 'Roboto',
		fontSize: 11,
		padding: 40,
		backgroundColor: '#ffffff',
		color: '#1a1a1a',
	},
	header: {
		marginBottom: 24,
		borderBottom: '2px solid #1a1a1a',
		paddingBottom: 12,
	},
	title: {
		fontSize: 20,
		fontWeight: 700,
		marginBottom: 4,
	},
	subtitle: {
		fontSize: 11,
		color: '#666666',
	},
	section: {
		marginBottom: 20,
	},
	sectionTitle: {
		fontSize: 13,
		fontWeight: 700,
		marginBottom: 8,
		backgroundColor: '#f5f5f5',
		padding: 6,
	},
	row: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		paddingVertical: 5,
		borderBottom: '1px solid #eeeeee',
	},
	rowLabel: {
		color: '#444444',
		flex: 1,
	},
	rowValue: {
		fontWeight: 700,
		textAlign: 'right',
		minWidth: 120,
	},
	rowValueRed: {
		fontWeight: 700,
		textAlign: 'right',
		minWidth: 120,
		color: '#dc2626',
	},
	rowValueGreen: {
		fontWeight: 700,
		textAlign: 'right',
		minWidth: 120,
		color: '#16a34a',
	},
	totalRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		paddingVertical: 8,
		marginTop: 4,
		borderTop: '2px solid #1a1a1a',
	},
	totalLabel: {
		fontWeight: 700,
		fontSize: 12,
	},
	totalValue: {
		fontWeight: 700,
		fontSize: 12,
		color: '#dc2626',
	},
	warningBox: {
		backgroundColor: '#fef9c3',
		border: '1px solid #fbbf24',
		padding: 10,
		marginTop: 20,
		marginBottom: 8,
	},
	warningText: {
		fontSize: 10,
		color: '#92400e',
	},
	footer: {
		position: 'absolute',
		bottom: 30,
		left: 40,
		right: 40,
		borderTop: '1px solid #eeeeee',
		paddingTop: 8,
		flexDirection: 'row',
		justifyContent: 'space-between',
	},
	footerText: {
		fontSize: 9,
		color: '#999999',
	},
	infoGrid: {
		flexDirection: 'row',
		gap: 12,
		marginBottom: 16,
	},
	infoCard: {
		flex: 1,
		backgroundColor: '#f9fafb',
		border: '1px solid #e5e7eb',
		padding: 10,
	},
	infoLabel: {
		fontSize: 9,
		color: '#6b7280',
		marginBottom: 3,
	},
	infoValue: {
		fontSize: 14,
		fontWeight: 700,
	},
})

interface SelfPayments {
	opv: number
	opvr: number
	vosms: number
	so: number
	total: number
}

interface Props {
	lang: Locale
	period: string
	totalIncome: number
	taxAmount: number
	selfPayments: SelfPayments
	userName?: string
	userIIN?: string
	generatedAt: string
}

function formatTenge(amount: number): string {
	return (
		new Intl.NumberFormat('ru-RU', {
			style: 'decimal',
			minimumFractionDigits: 0,
		}).format(amount) + ' ₸'
	)
}

export default function MonthlyReportPDF({
	lang,
	period,
	totalIncome,
	taxAmount,
	selfPayments,
	userName,
	generatedAt,
}: Props) {
	const isRu = lang === 'ru'

	const labels = {
		title: isRu ? 'Налоговый отчёт' : 'Салық есебі',
		subtitle: isRu
			? 'Индивидуальный предприниматель (Упрощённая декларация)'
			: 'Жеке кәсіпкер (Оңайлатылған декларация)',
		period: isRu ? 'Период' : 'Кезең',
		name: isRu ? 'Наименование ИП' : 'ЖК атауы',
		income: isRu ? 'Доходы' : 'Табыс',
		totalIncome: isRu ? 'Общий доход' : 'Жалпы табыс',
		taxSection: isRu ? 'Налог по 910 форме' : '910 нысаны бойынша салық',
		tax4: isRu ? 'Налог 4% от дохода' : 'Табыстан 4% салық',
		selfPayments: isRu
			? 'Соцплатежи за себя (ежемесячно)'
			: 'Өзі үшін әлеуметтік төлемдер (ай сайын)',
		opv: isRu ? 'ОПВ (10%)' : 'МЗЖ (10%)',
		opvr: isRu ? 'ОПВР (3.5%)' : 'МЖЗЖ (3.5%)',
		vosms: isRu ? 'ВОСМС (фикс.)' : 'МӘМС (бекіт.)',
		so: isRu ? 'СО (5%)' : 'ӘА (5%)',
		totalPayments: isRu ? 'Итого соцплатежи' : 'Әлеуметтік төлемдер жиыны',
		grandTotal: isRu ? 'ИТОГО К УПЛАТЕ' : 'БАРЛЫҒЫ ТӨЛЕНЕДІ',
		warning: isRu
			? '⚠️ Соцплатежи уплачиваются ежемесячно до 25 числа. Налог по 910 форме — до 25 августа (за 1-е полугодие) и до 25 февраля (за 2-е полугодие).'
			: '⚠️ Әлеуметтік төлемдер ай сайын 25-ке дейін төленеді. 910 нысаны бойынша салық — 1-жарты жыл үшін 25 тамызға дейін, 2-жарты жыл үшін 25 ақпанға дейін.',
		generated: isRu ? 'Сформировано' : 'Жасалды',
		salyqApp: 'SalyqApp — salyq.kz',
	}

	const grandTotal = taxAmount + selfPayments.total

	return (
		<Document>
			<Page size='A4' style={styles.page}>
				{/* Шапка */}
				<View style={styles.header}>
					<Text style={styles.title}>{labels.title}</Text>
					<Text style={styles.subtitle}>{labels.subtitle}</Text>
				</View>

				{/* Информация */}
				<View style={styles.section}>
					<View style={styles.infoGrid}>
						<View style={styles.infoCard}>
							<Text style={styles.infoLabel}>{labels.period}</Text>
							<Text style={styles.infoValue}>{period}</Text>
						</View>
						{userName && (
							<View style={styles.infoCard}>
								<Text style={styles.infoLabel}>{labels.name}</Text>
								<Text style={styles.infoValue}>{userName}</Text>
							</View>
						)}
						<View style={styles.infoCard}>
							<Text style={styles.infoLabel}>{labels.totalIncome}</Text>
							<Text style={styles.infoValue}>{formatTenge(totalIncome)}</Text>
						</View>
					</View>
				</View>

				{/* Налог */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>{labels.taxSection}</Text>
					<View style={styles.row}>
						<Text style={styles.rowLabel}>{labels.tax4}</Text>
						<Text style={styles.rowValueRed}>{formatTenge(taxAmount)}</Text>
					</View>
				</View>

				{/* Соцплатежи */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>{labels.selfPayments}</Text>
					<View style={styles.row}>
						<Text style={styles.rowLabel}>{labels.opv}</Text>
						<Text style={styles.rowValue}>{formatTenge(selfPayments.opv)}</Text>
					</View>
					<View style={styles.row}>
						<Text style={styles.rowLabel}>{labels.opvr}</Text>
						<Text style={styles.rowValue}>
							{formatTenge(selfPayments.opvr)}
						</Text>
					</View>
					<View style={styles.row}>
						<Text style={styles.rowLabel}>{labels.vosms}</Text>
						<Text style={styles.rowValue}>
							{formatTenge(selfPayments.vosms)}
						</Text>
					</View>
					<View style={styles.row}>
						<Text style={styles.rowLabel}>{labels.so}</Text>
						<Text style={styles.rowValue}>{formatTenge(selfPayments.so)}</Text>
					</View>
					<View style={styles.row}>
						<Text style={[styles.rowLabel, { fontWeight: 700 }]}>
							{labels.totalPayments}
						</Text>
						<Text style={styles.rowValue}>
							{formatTenge(selfPayments.total)}
						</Text>
					</View>
				</View>

				{/* Итого */}
				<View style={styles.totalRow}>
					<Text style={styles.totalLabel}>{labels.grandTotal}</Text>
					<Text style={styles.totalValue}>{formatTenge(grandTotal)}</Text>
				</View>

				{/* Предупреждение */}
				<View style={styles.warningBox}>
					<Text style={styles.warningText}>{labels.warning}</Text>
				</View>

				{/* Футер */}
				<View style={styles.footer} fixed>
					<Text style={styles.footerText}>{labels.salyqApp}</Text>
					<Text style={styles.footerText}>
						{labels.generated}: {generatedAt}
					</Text>
				</View>
			</Page>
		</Document>
	)
}
