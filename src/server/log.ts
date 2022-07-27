import { Logger } from 'tslog'

export const log: Logger = new Logger({
	name: 'API',
	minLevel: 'debug',
})