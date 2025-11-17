import { auth } from "@/lib/clients/auth"
import { toNextJsHandler } from "better-auth/next-js"

const { POST, GET } = toNextJsHandler(auth)

export { POST, GET }
