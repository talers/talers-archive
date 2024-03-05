import { read } from "./api/read"
import { write } from "./api/write"
import { headers } from "./utilities/headers"

const port = import.meta.env.PORT ?? 3000

Bun.serve({
	port,
	fetch(request) {
		try {
			const { pathname } = new URL(request.url)

			if (pathname.startsWith("/read/")) {
				return read(request)
			} else if (pathname.startsWith("/write/")) {
				return write(request)
			}

			return new Response("Welcome to Talers archive.")
		} catch (error) {
			console.error("Error", error)
			return new Response("Internal server error.", {
				status: 500,
				headers,
			})
		}
	},
})

console.log(`🚀 Server running at port ${port}`)
