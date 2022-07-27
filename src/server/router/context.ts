// src/server/router/context.ts
import { PrismaClient } from '@prisma/client'
import * as trpc from '@trpc/server'
import * as trpcNext from '@trpc/server/adapters/next'
import { NextApiRequest, NextApiResponse } from 'next'
import { Session, unstable_getServerSession as getServerSession } from 'next-auth'

import { authOptions as nextAuthOptions } from '../../pages/api/auth/[...nextauth]'
import { prisma } from '../db'
import { userAuthenticated } from './middleware'

export interface BaseContext {
	req?: NextApiRequest
	res?: NextApiResponse
	prisma: PrismaClient
}

export interface Context extends BaseContext {
	session?: Session
}

export interface AuthContext extends Context {
	req: NextApiRequest
	res: NextApiResponse
	session: Session
}

export const createContext = async (
	opts?: trpcNext.CreateNextContextOptions
): Promise<Context> => {
	const req = opts?.req
	const res = opts?.res

	const session =
		req &&
		res &&
		((await getServerSession(req, res, nextAuthOptions)) as Session)

	return {
		req,
		res,
		session,
		prisma,
	}
}

export const createRouter = () => trpc.router<Context>()
export const createAuthedRouter = () =>
	createRouter().middleware(userAuthenticated)