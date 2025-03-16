import {
	ConflictException,
	Injectable,
	NotFoundException,
	UnauthorizedException
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Request } from 'express'
import { IResult } from 'ua-parser-js'

import { PrismaService } from '@/src/core/prisma/prisma.service'
import { LoginDto } from '@/src/modules/auth/dto/login.dto'
import { RegisterDto } from '@/src/modules/auth/dto/register.dto'
import { PasswordService } from '@/src/modules/auth/services/password.service'
import { VerificationService } from '@/src/modules/verification/services/verification.service'
import { getSessionMetadata } from '@/src/shared/utils/session-metadata.util'
import { destroySession, saveSession } from '@/src/shared/utils/session.util'

@Injectable()
export class AuthService {
	public constructor(
		private readonly prismaService: PrismaService,
		private readonly passwordService: PasswordService,
		private readonly configService: ConfigService,
		private readonly verificationService: VerificationService
	) {}

	public async register(dto: RegisterDto) {
		const { email, password, username, name } = dto

		const isEmailExists = await this.prismaService.user.findUnique({
			where: {
				email
			}
		})

		if (isEmailExists) {
			throw new ConflictException(
				'Пользователь с такой почтой уже существует'
			)
		}

		const isUsernameExists = await this.prismaService.user.findUnique({
			where: {
				username
			}
		})

		if (isUsernameExists) {
			throw new ConflictException(
				'Пользователь с таким никнеймом уже существует'
			)
		}

		const hashedPassword = await this.passwordService.hashPassword(password)

		const user = await this.prismaService.user.create({
			data: {
				email,
				password: hashedPassword,
				name,
				username
			}
		})

		await this.verificationService.sendVerificationToken(user)

		return true
	}

	async login(req: Request, dto: LoginDto, userAgent: IResult) {
		const { login, password } = dto

		const user = await this.prismaService.user.findFirst({
			where: {
				OR: [
					{ username: { equals: login } },
					{ email: { equals: login } }
				]
			}
		})

		if (!user) {
			throw new NotFoundException('Пользователь не найден')
		}

		const isValidPassword = await this.passwordService.comparePasswords(
			password,
			user.password
		)

		if (!isValidPassword) {
			throw new UnauthorizedException('Неверный пароль')
		}

		if (!user.isEmailVerified) {
			const resendAvailabilityStatus =
				await this.verificationService.checkVerificationResendAvailability(
					user
				)

			if (resendAvailabilityStatus.isNeedResendVerification) {
				await this.verificationService.sendVerificationToken(user)

				throw new UnauthorizedException({
					message:
						'Аккаунт не верифицирован. Письмо для завершения регистрации повторно отправлено Вам на email'
				})
			}

			throw new UnauthorizedException({
				message:
					'Аккаунт не верифицирован. Письмо для завершения регистрации ранее было отправлено Вам на email',
				retryAfter: resendAvailabilityStatus.remainingCooldown
			})
		}

		const metadata = getSessionMetadata(req, userAgent)

		return saveSession(req, user, metadata)
	}

	async logout(req: Request) {
		return destroySession(req, this.configService)
	}
}
