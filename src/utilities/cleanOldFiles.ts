import { unlink } from "node:fs/promises"
import { readdirSync } from "node:fs"
import { join, parse } from "path"

export async function cleanOldFiles(directory: string) {
	// randomly skip this function to avoid running it on every request
	// it's not a big deal if we miss a few files, they will be cleaned up eventually
	if (Math.random() * 100 > 1) return

	const files = readdirSync(directory)
	if (files.length <= 500) return

	const sortedFiles = files.sort(
		(a, b) => parseInt(parse(b).name) - parseInt(parse(a).name)
	)
	const filesToDelete = sortedFiles.slice(500)

	filesToDelete.forEach(file => unlink(join(directory, file)))
}
