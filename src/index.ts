export interface Env {
	ED_TOKEN: string

	LAST_THREADS: KVNamespace
}

interface Thread {
	id: number
	number: number
	type: 'announcement' | 'question' | 'post'
	title: string
	document: string
	category: string
	is_private: boolean
	is_anonymous: boolean
	user: {
		name: string
	} | null
}

interface EdResponse {
	threads: Thread[]
}

interface Course {
	courseID: string
	edID: number
	announcementWebhook: string
	feedWebhook: string
}

import courses from '../courses.json'

const trim = (text: string, max: number) => text.length > max ? text.substring(0, max - 1) + '…' : text
const capitalize = (str: string) => str[0].toUpperCase() + str.slice(1)

const checkCourse = async ({ courseID, edID, announcementWebhook, feedWebhook }: Course, env: Env) => {
	const { threads } = await (await fetch(`https://us.edstem.org/api/courses/${edID}/threads?limit=100&sort=new`, {
		headers: {
			authorization: `Bearer ${env.ED_TOKEN}`
		}
	})).json() as EdResponse

	const lastThreadNumber = +(await env.LAST_THREADS.get(courseID) ?? 0)

	const newThreads = threads.filter(thread => thread.number > lastThreadNumber && !thread.is_private)
	if (!newThreads.length) return new Response('')

	await env.LAST_THREADS.put(courseID, Math.max(...threads.map(thread => thread.number)).toString())

	newThreads.sort((a, b) => a.number - b.number)

	for (const thread of newThreads) {
		const webhook = thread.type === 'announcement' ? announcementWebhook : feedWebhook
		await fetch(webhook + '?with_components=true', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				username: `${thread.is_anonymous ? 'Anonymous' : thread.user?.name} on Ed`,
				avatar_url: 'https://edcdn.net/assets/apple-touch-icon.f2974ade.png',
				content: trim(`## ${thread.title}\n${capitalize(thread.type)} in [${thread.category}](<https://edstem.org/us/courses/${edID}/discussion/?category=${encodeURIComponent(thread.category)}>)\n\n${thread.document}`, 2000),
				components: [
					{
						type: 1,
						components: [
							{
								type: 2,
								label: 'View on Ed',
								style: 5,
								url: `https://edstem.org/us/courses/${edID}/discussion/${thread.id}`
							}
						]
					}
				],
				allowed_mentions: {
					parse: []
				}
			})
		})
	}
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		return new Response('ok')
	},
	async scheduled(controller: ScheduledController, env: Env, ctx: ExecutionContext): Promise<void> {
		for (const course of courses) {
			await checkCourse(course, env)
		}
	}
}
