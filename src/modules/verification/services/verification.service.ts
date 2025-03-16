import {
	BadRequestException,
	Injectable,
	NotFoundException,
	UnauthorizedException
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { TokenType, User } from '@prisma/generated'
import type { Request } from 'express'
import { IResult } from 'ua-parser-js'

import { PrismaService } from '@/src/core/prisma/prisma.service'
import { MailService } from '@/src/modules/libs/mail/mail.service'
import { ResendEmailDto } from '@/src/modules/verification/dto/resend-email.dto'
import { VerificationDto } from '@/src/modules/verification/dto/verification.dto'
import { generateToken } from '@/src/shared/utils/generate-token.util'
import { getSessionMetadata } from '@/src/shared/utils/session-metadata.util'
import { saveSession } from '@/src/shared/utils/session.util'

@Injectable()
export class VerificationService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly mailService: MailService,
		private readonly configService: ConfigService
	) {}

	async verify(req: Request, dto: VerificationDto, userAgent: IResult) {
		const { token } = dto

		const existingToken = await this.prismaService.token.findUnique({
			where: {
				token,
				type: TokenType.EMAIL_VERIFY
			}
		})

		if (!existingToken) {
			throw new NotFoundException('Токен не найден')
		}

		const isExpired = new Date(existingToken.expiresIn) < new Date()

		if (isExpired) {
			throw new BadRequestException('Токен истек')
		}

		const user = await this.prismaService.user.update({
			where: {
				id: existingToken.userId
			},
			data: {
				isEmailVerified: true
			}
		})

		await this.prismaService.token.delete({
			where: {
				id: existingToken.id,
				type: TokenType.EMAIL_VERIFY
			}
		})

		const metadata = getSessionMetadata(req, userAgent)

		return saveSession(req, user, metadata)
	}

	async sendVerificationToken(user: User) {
		const verificationToken = await generateToken(
			this.prismaService,
			user,
			TokenType.EMAIL_VERIFY,
			true
		)

		await this.mailService.sendVerificationToken(
			user.email,
			verificationToken.token
		)
	}

	async resendEmail(dto: ResendEmailDto) {
		const { login } = dto

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

		const resendAvailabilityStatus =
			await this.checkVerificationResendAvailability(user)

		if (resendAvailabilityStatus.isNeedResendVerification) {
			await this.sendVerificationToken(user)
		} else {
			throw new UnauthorizedException({
				message:
					'Аккаунт не верифицирован. Письмо для завершения регистрации ранее было отправлено Вам на email',
				retryAfter: resendAvailabilityStatus.remainingCooldown
			})
		}

		return true
	}

	async checkVerificationResendAvailability(user: User) {
		let isNeedResendVerification = true

		let remainingCooldown = 0

		const cooldownSeconds =
			this.configService.getOrThrow<number>(
				'VERIFICATION_COOLDOWN_SECONDS'
			) || 300

		const existingToken = await this.prismaService.token.findFirst({
			where: {
				userId: user.id,
				type: TokenType.EMAIL_VERIFY
			}
		})

		if (existingToken) {
			const diffSeconds = Math.floor(
				(new Date().getTime() - existingToken.createdAt.getTime()) /
					1000
			)
			remainingCooldown = cooldownSeconds - diffSeconds

			if (remainingCooldown > 0) {
				isNeedResendVerification = false
			}
		}

		return {
			remainingCooldown,
			isNeedResendVerification
		}
	}
}
