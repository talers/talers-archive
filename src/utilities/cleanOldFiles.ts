import { unlink, readdir } from "node:fs/promises"
import { join, parse } from "path"

export const cleanOldFilesInterval = 1000 * 60 * 60 * 24 // 1 day

export const cleaningOldFiles = new Set<string>()

export async function cleanOldFiles(directory: string) {
	if (cleaningOldFiles.has(directory)) return
	cleaningOldFiles.add(directory)

	const files = await readdir(directory)
	if (files.length <= 500) return

	const sortedFiles = files.sort(
		(a, b) => parseInt(parse(b).name) - parseInt(parse(a).name)
	)
	const filesToDelete = sortedFiles.slice(500)

	await Promise.all(filesToDelete.map(file => unlink(join(directory, file))))

	setTimeout(() => {
		cleaningOldFiles.delete(directory)
	}, cleanOldFilesInterval)
}
