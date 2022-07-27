import { WithTRPCConfig } from '@trpc/next'
import { createReactQueryHooks, CreateTRPCClientOptions } from '@trpc/react'
import { QueryClientConfig } from 'react-query'
import superjson from 'superjson'
import type { AppRouter } from '../server/router'

const getBaseUrl = () => {
	if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}` // SSR should use vercel url
	if (process.env.RAILWAY_STATIC_URL)
		return `https://${process.env.RAILWAY_STATIC_URL}` // live dev SSR should use vercel url
	return `http://localhost:${process.env.PORT ?? 3000}` // dev SSR should use localhost
}

export const trpc = createReactQueryHooks<AppRouter>()

export const trpcQueryClientConfig: QueryClientConfig = {
	defaultOptions: {
		queries: {
			retry: false,
			refetchOnWindowFocus: false,
			queryKeyHashFn: superjson.stringify,
		},
		mutations: { retry: false },
	},
}

export const trpcClientConfig: CreateTRPCClientOptions<AppRouter> &
	WithTRPCConfig<AppRouter> = {
	url: `${getBaseUrl()}/api/trpc`,
	transformer: superjson,
	queryClientConfig: trpcQueryClientConfig,
	fetch(input, init?) {
		return fetch(input, {
			...init,
			credentials: 'same-origin',
		})
	},
}

export const trpcClient = trpc.createClient(trpcClientConfig)