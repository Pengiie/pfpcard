import { ProcedureType, TRPCError } from '@trpc/server'
import {
	MiddlewareFunction,
	MiddlewareResult,
} from '@trpc/server/dist/declarations/src/internals/middlewares'
import { log } from '../log'
import { AuthContext, Context } from './context'

export type Middleware<TInputContext, TResult> = (opts: {
	ctx: TInputContext
	type: ProcedureType
	path: string
	rawInput: unknown
	next: {
		(): Promise<MiddlewareResult<TInputContext>>
		<T>(opts: { ctx: T }): Promise<MiddlewareResult<T>>
	}
}) => Promise<MiddlewareResult<TResult>>

export const userAuthenticated: Middleware<Context, AuthContext> = ({
	ctx,
	next,
}) => {
	if (!ctx.session) {
		throw new TRPCError({
			code: 'UNAUTHORIZED',
			message: 'User is not signed in',
		})
	}
	return next({
		ctx: {
			...ctx,
			req: ctx.req!,
			res: ctx.res!,
			session: ctx.session,
		},
	})
}

export const timingsLog: Middleware<Context, Context> = async ({
	ctx,
	path,
	type,
	next,
}) => {
	const start = Date.now()
	const result = await next()
	const durationMs = Date.now() - start
	result.ok
		? log.info('OK request timing:', { path, type, durationMs })
		: log.info('Non-OK request timing', { path, type, durationMs })

	return result
}