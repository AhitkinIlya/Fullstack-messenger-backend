import type { Request } from 'express'
import { lookup } from 'geoip-lite'
import * as countries from 'i18n-iso-countries'
import { IResult } from 'ua-parser-js'

import type { SessionMetadata } from '../types/session-metadata.types'

import { IS_DEV_ENV } from './is-dev.util'

countries.registerLocale(require('i18n-iso-countries/langs/en.json'))

export function getSessionMetadata(
	req: Request,
	userAgent: IResult
): SessionMetadata {
	const ip = IS_DEV_ENV
		? '94.51.4.183'
		: Array.isArray(req.headers['cf-connecting-ip'])
			? req.headers['cf-connecting-ip'][0]
			: req.headers['cf-connecting-ip'] ||
				(typeof req.headers['x-forwarded-for'] === 'string'
					? req.headers['x-forwarded-for'].split(',')[0]
					: req.ip)

	const location = lookup(ip)

	return {
		location: {
			country: countries.getName(location.country, 'en') || 'Неизвестно',
			city: location.city || 'Неизвестно'
		},
		device: {
			browser: userAgent.browser,
			os: userAgent
		}
	}
}
