import { stat, exists, readdir } from "node:fs/promises"
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

	if (!(await exists(filePath))) {
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
			if (aIsFile && bIsFile) return Number(a) > Number(b) ? -1 : 1
			if (aIsFile) return -1
			return 1
		})

		return new Response(
			`
			<!DOCTYPE html>
			<html>
				<head>
					<title>${path} • Archive</title>
				</head>
				<body>
					<h1>🗂️ ${path}</h1>
					${children
						.map(child => {
							let label = parse(child).name
							if (label == String(Number(label))) {
								label = Intl.DateTimeFormat(undefined, {
									dateStyle: "long",
									timeStyle: "short",
								}).format(new Date(Number(label)))
							}
							return `<p> &nbsp; • 📄 <a href="/read/${path}/${child}">${label}</a></p>`
						})
						.join("")}
				</body>
			</html>
		`,
			{
				// status: 200,
				headers: {
					...headers,
					"content-type": "text/html; charset=utf-8",
				},
			}
		)
	} else {
		return new Response(Bun.file(filePath), {
			status: 200,
			headers,
		})
	}
}
