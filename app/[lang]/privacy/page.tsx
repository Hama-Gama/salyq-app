import type { Locale } from '@/types'
import Link from 'next/link'

export default async function PrivacyPage({
	params,
}: {
	params: Promise<{ lang: string }>
}) {
	const { lang: langParam } = await params
	const lang = langParam as Locale
	const isRu = lang === 'ru'
	const prefix = lang === 'kz' ? '/kz' : ''

	return (
		<div className='min-h-screen bg-background'>
			<header className='border-b'>
				<div className='mx-auto max-w-4xl px-4 h-14 flex items-center justify-between'>
					<Link href={`${prefix}/`} className='text-xl font-bold'>
						SalyqApp
					</Link>
					<Link
						href={`${prefix}/login`}
						className='text-base text-muted-foreground hover:text-foreground'
					>
						{isRu ? 'Войти' : 'Кіру'}
					</Link>
				</div>
			</header>

			<main className='mx-auto max-w-4xl px-4 py-12 space-y-8'>
				<div>
					<h1 className='text-3xl font-bold mb-2'>
						{isRu ? 'Политика конфиденциальности' : 'Құпиялылық саясаты'}
					</h1>
					<p className='text-base text-muted-foreground'>
						{isRu
							? 'Последнее обновление: 1 апреля 2026 г.'
							: 'Соңғы жаңарту: 2026 жылғы 1 сәуір'}
					</p>
				</div>

				{isRu ? (
					<div className='space-y-6 text-base leading-relaxed'>
						<section>
							<h2 className='text-xl font-semibold mb-3'>
								1. Какие данные мы собираем
							</h2>
							<ul className='list-disc pl-6 space-y-1'>
								<li>Имя и адрес электронной почты (при входе через Google).</li>
								<li>
									ИИН — только если вы указали его в профиле (хранится в
									зашифрованном виде AES-256).
								</li>
								<li>Данные о доходах, введённые вами в сервис.</li>
								<li>
									Telegram Chat ID — только если вы привязали уведомления.
								</li>
								<li>
									Данные об использовании сервиса (логи ошибок через Sentry).
								</li>
							</ul>
						</section>

						<section>
							<h2 className='text-xl font-semibold mb-3'>
								2. Как мы используем данные
							</h2>
							<ul className='list-disc pl-6 space-y-1'>
								<li>
									Для предоставления функций сервиса (расчёт налогов, история
									доходов).
								</li>
								<li>
									Для отправки уведомлений о налоговых дедлайнах (только если вы
									подключили Telegram).
								</li>
								<li>Для улучшения сервиса (анализ ошибок).</li>
								<li>Для администрирования подписок и промокодов.</li>
							</ul>
						</section>

						<section>
							<h2 className='text-xl font-semibold mb-3'>
								3. Передача данных третьим лицам
							</h2>
							<p>
								Мы не продаём и не передаём ваши персональные данные третьим
								лицам, за исключением:
							</p>
							<ul className='list-disc pl-6 mt-2 space-y-1'>
								<li>
									<b>Supabase</b> — хранение данных (PostgreSQL, серверы AWS).
								</li>
								<li>
									<b>Vercel</b> — хостинг приложения.
								</li>
								<li>
									<b>Sentry</b> — мониторинг ошибок (без персональных данных).
								</li>
								<li>
									<b>Upstash</b> — кэширование и очереди задач.
								</li>
								<li>
									<b>Telegram</b> — доставка уведомлений (только Chat ID).
								</li>
							</ul>
						</section>

						<section>
							<h2 className='text-xl font-semibold mb-3'>
								4. Безопасность данных
							</h2>
							<ul className='list-disc pl-6 space-y-1'>
								<li>
									ИИН шифруется алгоритмом AES-256-GCM перед сохранением в базу
									данных.
								</li>
								<li>Все соединения защищены протоколом HTTPS/TLS.</li>
								<li>Доступ к базе данных ограничен и защищён паролем.</li>
								<li>
									Мы не имеем доступа к вашему паролю Google — авторизация
									осуществляется через OAuth 2.0.
								</li>
							</ul>
						</section>

						<section>
							<h2 className='text-xl font-semibold mb-3'>5. Хранение данных</h2>
							<p>
								Данные хранятся на серверах Supabase (AWS, регион
								ap-southeast-1). Данные удаляются по запросу пользователя или
								при удалении аккаунта.
							</p>
						</section>

						<section>
							<h2 className='text-xl font-semibold mb-3'>6. Ваши права</h2>
							<ul className='list-disc pl-6 space-y-1'>
								<li>Запросить копию ваших данных.</li>
								<li>Потребовать удаления данных.</li>
								<li>Исправить неточные данные через профиль.</li>
								<li>Отозвать согласие на обработку данных.</li>
							</ul>
							<p className='mt-2'>
								Для реализации прав обратитесь через форму поддержки в
								приложении.
							</p>
						</section>

						<section>
							<h2 className='text-xl font-semibold mb-3'>7. Cookies</h2>
							<p>
								Сервис использует сессионные cookies для авторизации. Мы не
								используем рекламные cookies или трекинг-пиксели.
							</p>
						</section>

						<section>
							<h2 className='text-xl font-semibold mb-3'>
								8. Изменения политики
							</h2>
							<p>
								О существенных изменениях мы уведомим через email или
								уведомление в приложении. Продолжение использования сервиса
								после изменений означает согласие с новой политикой.
							</p>
						</section>
					</div>
				) : (
					<div className='space-y-6 text-base leading-relaxed'>
						<section>
							<h2 className='text-xl font-semibold mb-3'>
								1. Қандай деректер жинаймыз
							</h2>
							<ul className='list-disc pl-6 space-y-1'>
								<li>
									Аты-жөні және электрондық пошта мекенжайы (Google арқылы кіру
									кезінде).
								</li>
								<li>
									ЖСН — тек профильде көрсетсеңіз ғана (AES-256 шифрланған түрде
									сақталады).
								</li>
								<li>Сервиске енгізген табыс деректері.</li>
								<li>
									Telegram Chat ID — тек хабарландыруларды байланыстырсаңыз
									ғана.
								</li>
								<li>
									Сервисті пайдалану деректері (Sentry арқылы қате журналдары).
								</li>
							</ul>
						</section>

						<section>
							<h2 className='text-xl font-semibold mb-3'>
								2. Деректерді қалай пайдаланамыз
							</h2>
							<ul className='list-disc pl-6 space-y-1'>
								<li>
									Сервис функцияларын ұсыну үшін (салық есебі, табыс тарихы).
								</li>
								<li>
									Салық мерзімдері туралы хабарландырулар жіберу үшін (тек
									Telegram байланыстырсаңыз).
								</li>
								<li>Сервисті жақсарту үшін (қателерді талдау).</li>
								<li>Жазылымдар мен промокодтарды басқару үшін.</li>
							</ul>
						</section>

						<section>
							<h2 className='text-xl font-semibold mb-3'>
								3. Үшінші тұлғаларға деректер беру
							</h2>
							<p>
								Біз сіздің дербес деректеріңізді сатпаймыз және үшінші
								тұлғаларға бермейміз, мыналардан басқа:
							</p>
							<ul className='list-disc pl-6 mt-2 space-y-1'>
								<li>
									<b>Supabase</b> — деректерді сақтау (PostgreSQL, AWS
									серверлері).
								</li>
								<li>
									<b>Vercel</b> — қолданбаны орналастыру.
								</li>
								<li>
									<b>Sentry</b> — қателерді бақылау (дербес деректерсіз).
								</li>
								<li>
									<b>Upstash</b> — кэштеу және тапсырмалар кезегі.
								</li>
								<li>
									<b>Telegram</b> — хабарландыруларды жеткізу (тек Chat ID).
								</li>
							</ul>
						</section>

						<section>
							<h2 className='text-xl font-semibold mb-3'>
								4. Деректер қауіпсіздігі
							</h2>
							<ul className='list-disc pl-6 space-y-1'>
								<li>
									ЖСН дерекқорға сақталмас бұрын AES-256-GCM алгоритмімен
									шифрланады.
								</li>
								<li>Барлық қосылымдар HTTPS/TLS протоколымен қорғалған.</li>
								<li>
									Дерекқорға қол жетімділік шектелген және құпия сөзбен
									қорғалған.
								</li>
							</ul>
						</section>

						<section>
							<h2 className='text-xl font-semibold mb-3'>
								5. Деректерді сақтау
							</h2>
							<p>
								Деректер Supabase серверлерінде (AWS, ap-southeast-1 аймағы)
								сақталады. Деректер пайдаланушының сұранысы бойынша немесе
								аккаунт жойылған кезде жойылады.
							</p>
						</section>

						<section>
							<h2 className='text-xl font-semibold mb-3'>
								6. Сіздің құқықтарыңыз
							</h2>
							<ul className='list-disc pl-6 space-y-1'>
								<li>Деректеріңіздің көшірмесін сұрату.</li>
								<li>Деректерді жоюды талап ету.</li>
								<li>Профиль арқылы дәл емес деректерді түзету.</li>
								<li>Деректерді өңдеуге келісімді кері қайтару.</li>
							</ul>
						</section>

						<section>
							<h2 className='text-xl font-semibold mb-3'>7. Cookies</h2>
							<p>
								Сервис авторизация үшін сессиялық cookies пайдаланады. Біз
								жарнамалық cookies немесе трекинг-пикселдер пайдаланбаймыз.
							</p>
						</section>
					</div>
				)}
			</main>

			<footer className='border-t py-6 mt-12'>
				<div className='mx-auto max-w-4xl px-4 flex gap-4 text-base text-muted-foreground'>
					<Link href={`${prefix}/`} className='hover:text-foreground'>
						{isRu ? 'Главная' : 'Басты бет'}
					</Link>
					<Link href={`${prefix}/terms`} className='hover:text-foreground'>
						{isRu ? 'Оферта' : 'Оферта'}
					</Link>
				</div>
			</footer>
		</div>
	)
}
