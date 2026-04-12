import type { Locale } from '@/types'
import Link from 'next/link'

export default async function TermsPage({
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
			{/* Навигация */}
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
						{isRu ? 'Публичная оферта' : 'Жария оферта'}
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
							<h2 className='text-xl font-semibold mb-3'>1. Общие положения</h2>
							<p>
								Настоящий документ является публичной офертой (предложением) ИП
								SalyqApp (далее — «Исполнитель») о заключении договора об
								оказании информационных услуг с любым физическим лицом (далее —
								«Пользователь»), принявшим условия настоящей оферты.
							</p>
							<p className='mt-2'>
								Акцептом оферты является регистрация и/или использование сервиса
								SalyqApp по адресу salyq-app.vercel.app.
							</p>
						</section>

						<section>
							<h2 className='text-xl font-semibold mb-3'>
								2. Предмет договора
							</h2>
							<p>
								Исполнитель предоставляет Пользователю доступ к программному
								обеспечению SalyqApp — онлайн-сервису для автоматического
								расчёта налогов и социальных платежей индивидуального
								предпринимателя Республики Казахстан, работающего по упрощённой
								декларации (форма 910).
							</p>
						</section>

						<section>
							<h2 className='text-xl font-semibold mb-3'>3. Тарифы и оплата</h2>
							<p>Сервис предоставляется на следующих условиях:</p>
							<ul className='list-disc pl-6 mt-2 space-y-1'>
								<li>
									<b>Тариф «Старт»</b> — бесплатно, без ограничения по времени.
								</li>
								<li>
									<b>Тариф «Профи»</b> — 3 900 тг/месяц или 39 000 тг/год.
								</li>
								<li>
									<b>Тариф «Бизнес»</b> — 39 000 тг/год.
								</li>
							</ul>
							<p className='mt-2'>
								Оплата производится в тенге Республики Казахстан. После оплаты
								доступ предоставляется немедленно.
							</p>
						</section>

						<section>
							<h2 className='text-xl font-semibold mb-3'>4. Возврат средств</h2>
							<p>
								Возврат средств осуществляется в течение 7 дней с момента оплаты
								при условии, что Пользователь не использовал платные функции
								сервиса. Для возврата необходимо обратиться в службу поддержки.
							</p>
						</section>

						<section>
							<h2 className='text-xl font-semibold mb-3'>
								5. Ограничение ответственности
							</h2>
							<p>
								Сервис SalyqApp предоставляет расчёты в информационных целях.
								Исполнитель не несёт ответственности за:
							</p>
							<ul className='list-disc pl-6 mt-2 space-y-1'>
								<li>Ошибки, допущенные Пользователем при вводе данных.</li>
								<li>
									Изменения в налоговом законодательстве РК, вступившие в силу
									после последнего обновления сервиса.
								</li>
								<li>
									Убытки, возникшие в результате использования или невозможности
									использования сервиса.
								</li>
							</ul>
							<p className='mt-2'>
								Пользователь самостоятельно несёт ответственность за
								правильность и своевременность уплаты налогов и социальных
								платежей.
							</p>
						</section>

						<section>
							<h2 className='text-xl font-semibold mb-3'>
								6. Персональные данные
							</h2>
							<p>
								Исполнитель обрабатывает персональные данные Пользователя в
								соответствии с Политикой конфиденциальности, доступной по адресу{' '}
								<Link href='/privacy' className='text-primary underline'>
									/privacy
								</Link>
								. ИИН Пользователя хранится в зашифрованном виде (AES-256) и не
								передаётся третьим лицам.
							</p>
						</section>

						<section>
							<h2 className='text-xl font-semibold mb-3'>7. Прочие условия</h2>
							<p>
								Настоящая оферта регулируется законодательством Республики
								Казахстан. Все споры решаются путём переговоров, а при
								недостижении согласия — в судебном порядке по месту нахождения
								Исполнителя.
							</p>
							<p className='mt-2'>
								Исполнитель вправе изменять условия оферты в одностороннем
								порядке. Изменения вступают в силу с момента публикации на
								сайте.
							</p>
						</section>

						<section>
							<h2 className='text-xl font-semibold mb-3'>8. Контакты</h2>
							<p>
								По всем вопросам обращайтесь через форму поддержки в приложении
								или по адресу электронной почты, указанному в профиле сервиса.
							</p>
						</section>
					</div>
				) : (
					<div className='space-y-6 text-base leading-relaxed'>
						<section>
							<h2 className='text-xl font-semibold mb-3'>1. Жалпы ережелер</h2>
							<p>
								Осы құжат SalyqApp ЖК (бұдан әрі — «Орындаушы») тарапынан осы
								офертаның шарттарын қабылдаған кез келген жеке тұлғамен (бұдан
								әрі — «Пайдаланушы») ақпараттық қызметтер көрсету туралы шарт
								жасасуға арналған жария оферта болып табылады.
							</p>
							<p className='mt-2'>
								Офертаны акцепттеу — salyq-app.vercel.app мекенжайындағы
								SalyqApp сервисінде тіркелу және/немесе пайдалану.
							</p>
						</section>

						<section>
							<h2 className='text-xl font-semibold mb-3'>2. Шарттың мәні</h2>
							<p>
								Орындаушы Пайдаланушыға SalyqApp бағдарламалық қамтамасыз етуіне
								— оңайлатылған декларация (910 нысаны) бойынша жұмыс істейтін
								Қазақстан Республикасының жеке кәсіпкерінің салықтары мен
								әлеуметтік төлемдерін автоматты есептеуге арналған
								онлайн-сервиске — қол жеткізуді ұсынады.
							</p>
						</section>

						<section>
							<h2 className='text-xl font-semibold mb-3'>
								3. Тарифтер және төлем
							</h2>
							<p>Сервис мынадай шарттарда ұсынылады:</p>
							<ul className='list-disc pl-6 mt-2 space-y-1'>
								<li>
									<b>«Старт» тарифі</b> — тегін, уақыт шектеусіз.
								</li>
								<li>
									<b>«Про» тарифі</b> — 3 900 тг/ай немесе 39 000 тг/жыл.
								</li>
								<li>
									<b>«Бизнес» тарифі</b> — 39 000 тг/жыл.
								</li>
							</ul>
							<p className='mt-2'>
								Төлем Қазақстан Республикасының теңгесімен жүзеге асырылады.
								Төлемнен кейін қол жетімділік бірден беріледі.
							</p>
						</section>

						<section>
							<h2 className='text-xl font-semibold mb-3'>
								4. Қаражатты қайтару
							</h2>
							<p>
								Пайдаланушы ақылы функцияларды пайдаланбаған жағдайда төлем
								сәтінен бастап 7 күн ішінде қаражат қайтарылады. Қайтару үшін
								қолдау қызметіне хабарласу қажет.
							</p>
						</section>

						<section>
							<h2 className='text-xl font-semibold mb-3'>
								5. Жауапкершілікті шектеу
							</h2>
							<p>
								SalyqApp сервисі ақпараттық мақсатта есептеулер ұсынады.
								Орындаушы мыналар үшін жауапты емес:
							</p>
							<ul className='list-disc pl-6 mt-2 space-y-1'>
								<li>Пайдаланушы деректерді енгізу кезінде жіберген қателер.</li>
								<li>
									Сервистің соңғы жаңартуынан кейін күшіне енген ҚР салық
									заңнамасындағы өзгерістер.
								</li>
								<li>
									Сервисті пайдалану немесе пайдалана алмау нәтижесінде
									туындаған шығындар.
								</li>
							</ul>
						</section>

						<section>
							<h2 className='text-xl font-semibold mb-3'>6. Дербес деректер</h2>
							<p>
								Орындаушы Пайдаланушының дербес деректерін{' '}
								<Link href='/kz/privacy' className='text-primary underline'>
									/privacy
								</Link>{' '}
								мекенжайында қол жетімді Құпиялылық саясатына сәйкес өңдейді.
								Пайдаланушының ЖСН шифрланған түрде (AES-256) сақталады және
								үшінші тұлғаларға берілмейді.
							</p>
						</section>

						<section>
							<h2 className='text-xl font-semibold mb-3'>7. Өзге шарттар</h2>
							<p>
								Осы оферта Қазақстан Республикасының заңнамасымен реттеледі.
								Барлық дауларды келіссөздер арқылы шешуге тырысады, ал келісімге
								қол жеткізілмеген жағдайда — Орындаушының орналасқан жері
								бойынша сот тәртібімен.
							</p>
						</section>

						<section>
							<h2 className='text-xl font-semibold mb-3'>8. Байланыс</h2>
							<p>
								Барлық сұрақтар бойынша қолданбадағы қолдау нысаны арқылы
								хабарласыңыз.
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
					<Link href={`${prefix}/privacy`} className='hover:text-foreground'>
						{isRu ? 'Политика конфиденциальности' : 'Құпиялылық саясаты'}
					</Link>
				</div>
			</footer>
		</div>
	)
}
