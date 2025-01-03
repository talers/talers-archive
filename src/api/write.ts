import { headers } from "../utilities/headers"
import { mkdir } from "node:fs/promises"
import { root } from "../utilities/root"
import { cleanOldFiles } from "../utilities/cleanOldFiles"

export async function write(request: Request) {
	const { body } = request

	if (!body) {
		console.error("No body for request.")
		return new Response("No body.", {
			status: 400,
			headers,
		})
	}

	const { pathname } = new URL(request.url)
	let path = pathname.slice("/write/".length)
	if (!path) {
		console.error("No path for request.")
		return new Response("Bad parameters.", {
			status: 400,
			headers,
		})
	}

	const type: "text" | "binary" = request.headers.get("content-type")?.startsWith("text")
		? "text"
		: "binary"

	// remove starting and trailing slashes
	while (path.startsWith("/")) {
		path = path.slice(1)
	}
	while (path.endsWith("/")) {
		path = path.slice(0, -1)
	}

	await mkdir(`${root}/${path}`, { recursive: true })

	// clean old unused files
	cleanOldFiles(`${root}/${path}`)

	const filePath = `${root}/${path}/${Date.now()}${type == "text" ? ".txt" : ""}`
	let size = 0

	// Stream the body to the file with Bun File Sinker
	let file = Bun.file(filePath)
	let writer = file.writer()

	try {
		for await (const chunk of body as unknown as AsyncIterable<Uint8Array>) {
			writer.write(chunk)
			size += chunk.byteLength
		}
	} catch (error) {
		await writer.end()
		return new Response(`Error writing file '${path}': ${error}`, {
			status: 500,
			headers,
		})
	}

	await writer.end()

	// console.log(` • Wrote ${size} bytes to '${filePath}'`)
	return new Response(`Wrote ${size} bytes to '${path}'.`, {
		headers,
	})
}
