import { createRouter } from "./context"
import superjson from 'superjson'
import { timingsLog } from "./middleware"

export const appRouter = createRouter()
	.transformer(superjson)
	.middleware(timingsLog);

export type AppRouter = typeof appRouter