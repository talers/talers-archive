export const adminKey =
	globalThis.process?.env?.ADMIN_KEY ?? import.meta.env?.ADMIN_KEY ?? "toto"
