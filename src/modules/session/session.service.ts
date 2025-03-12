import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { User } from '@prisma/generated'
import type { Request } from 'express'

@Injectable()
export class SessionService {
	constructor(private readonly configService: ConfigService) {}

	saveSession(req: Request, user: User) {
		return new Promise((resolve, reject) => {
			req.session.createdAt = new Date()
			req.session.userId = user.id

			req.session.save(err => {
				if (err) {
					return reject(
						new InternalServerErrorException(
							'Не удалось сохранить сессию'
						)
					)
				}

				resolve({ user })
			})
		})
	}

	destroySession(req: Request) {
		return new Promise((resolve, reject) => {
			req.session.destroy(err => {
				if (err) {
					return reject(
						new InternalServerErrorException(
							'Не удалось завершить сессию'
						)
					)
				}

				if (req.res) {
					req.res.clearCookie(
						this.configService.getOrThrow<string>('SESSION_NAME')
					)
				}

				resolve(true)
			})
		})
	}
}
