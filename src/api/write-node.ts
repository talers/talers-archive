import { headers } from "../utilities/headers"
import { mkdir, open } from "node:fs/promises"
import { root } from "../utilities/root"
import { cleanOldFiles } from "../utilities/cleanOldFiles"
import type { IncomingMessage, ServerResponse } from "node:http"

export async function write(
	pathname: string,
	request: IncomingMessage,
	response: ServerResponse
) {
	// const { body } = request

	// if (!body) {
	// 	console.error("No body for request.")
	// 	return new Response("No body.", {
	// 		status: 400,
	// 		headers,
	// 	})
	// }

	let path = pathname.slice("/write/".length)
	if (!path) {
		console.error("No path for request.")
		return new Response("Bad parameters.", {
			status: 400,
			headers,
		})
	}

	const type: "text" | "binary" = request.headers["content-type"]?.startsWith("text")
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

	// Method 1: Stream the body to the file with Bun File Sinker
	// (very fast)
	// {
	// 	let file = Bun.file(filePath)
	// 	let writer = file.writer()
	// 	// stream the body to the file
	// 	for await (const chunk of body as unknown as AsyncIterable<Uint8Array>) {
	// 		writer.write(chunk)
	// 		size += chunk.byteLength
	// 	}
	// 	await writer.end()
	// }

	// Method 2: Don't stream
	// (fastest, but no streaming)
	// {
	// 	const now = Bun.nanoseconds()
	// 	Bun.write(filePath, await request.arrayBuffer())
	// 	console.log("Time #2: ", Bun.nanoseconds() - now)
	// }

	// Method 3: Open the file as a stream and append the body
	// (slowest)
	const file = await open(filePath, "a+")

	console.time("Time #3")
	request.pipe(file.createWriteStream())
	request.on("close", async () => {
		await file.close()
	})
	console.timeEnd("Time #3")

	response.end(`Wrote ${size} bytes to '${path}'.`)
}
