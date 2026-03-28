export default async function LangHomePage({
	params,
}: {
	params: Promise<{ lang: string }>
}) {
	const { lang } = await params

	return (
		<main style={{ padding: '2rem' }}>
			<h1>SalyqApp</h1>
			<p>Язык: {lang}</p>
			<p>Проект запущен ✅</p>
		</main>
	)
}
