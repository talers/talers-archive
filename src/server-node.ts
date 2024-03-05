import http from "http"
// import { read } from "./api/read"
import { write } from "./api/write-node"
import { headers } from "./utilities/headers"
// import { headers } from "./utilities/headers"

const port = globalThis.process?.env?.PORT ?? import.meta.env?.PORT ?? 3000

// create a node server

const server = http.createServer((request, response) => {
	let url = request.url ?? ""
	if (url?.startsWith("/")) {
		url = `http://localhost:${port}` + url
	}
	console.log("url", url)
	const { pathname } = new URL(url)

	for (const [key, value] of Object.entries(headers)) {
		response.setHeader(key, value)
	}

	if (pathname.startsWith("/read/")) {
		// read(req)
		response.writeHead(200, { "Content-Type": "text/plain" })
		response.end("Read not done yet.")
	} else if (pathname.startsWith("/write/")) {
		write(pathname, request, response)
	} else {
		response.writeHead(200, { "Content-Type": "text/plain" })
		response.end("Welcome to Talers archive.")
	}
})

server.listen(port, () => {
	console.log(`🚀 Server running at port ${port}`)
})
