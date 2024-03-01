import { adminKey } from "./adminKey"

export const headers: HeadersInit = {}

if (adminKey == "toto") {
	// in local mode, allow every origin
	headers["Access-Control-Allow-Origin"] = "*"
}
