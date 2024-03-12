import { stat, readdir } from "node:fs/promises"
import { existsSync } from "node:fs"
import { parse } from "node:path"
import { root } from "../utilities/root"
import { headers } from "../utilities/headers"
import { adminKey } from "../utilities/adminKey"

export async function read(request: Request) {
	const key = request.headers.get("admin-key")
	if (key !== adminKey) {
		return new Response("Unauthorized.", {
			status: 401,
			headers,
		})
	}

	const { pathname } = new URL(request.url)
	let path = pathname.slice("/read/".length)
	if (!path) {
		console.error("No path for request.")
		return new Response("No path for request.", {
			status: 400,
			headers,
		})
	}

	const filePath = `${root}/${path}`
	const stats = await stat(filePath)

	if (!existsSync(filePath)) {
		console.error(`File not found: '${path}'.`)
		return new Response("File not found.", {
			status: 404,
			headers,
		})
	}

	if (stats.isDirectory()) {
		const children = (await readdir(filePath)).sort((a, b) => {
			a = parse(a).name
			b = parse(b).name
			const aIsFile = a == String(Number(a))
			const bIsFile = b == String(Number(b))
			if (aIsFile && bIsFile) return parseInt(a) > parseInt(b) ? -1 : 1
			if (aIsFile) return -1
			return 1
		})

		return new Response(JSON.stringify(children), {
			headers: {
				...headers,
				"content-type": "application/json",
			},
		})
	} else {
		return new Response(Bun.file(filePath), {
			status: 200,
			headers,
		})
	}
}
