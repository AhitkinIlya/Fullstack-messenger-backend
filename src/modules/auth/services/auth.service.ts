import {
	ConflictException,
	Injectable,
	NotFoundException,
	UnauthorizedException
} from '@nestjs/common'
import { Request } from 'express'

import { PrismaService } from '@/src/core/prisma/prisma.service'
import { LoginDto } from '@/src/modules/auth/dto/login.dto'
import { RegisterDto } from '@/src/modules/auth/dto/register.dto'
import { PasswordService } from '@/src/modules/auth/services/password.service'
import { SessionService } from '@/src/modules/session/session.service'

@Injectable()
export class AuthService {
	public constructor(
		private readonly prismaService: PrismaService,
		private readonly passwordService: PasswordService,
		private readonly sessionService: SessionService
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

		return this.prismaService.user.create({
			data: {
				email,
				password: hashedPassword,
				name,
				username
			}
		})
	}

	async login(req: Request, dto: LoginDto) {
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

		return this.sessionService.saveSession(req, user)
	}

	async logout(req: Request) {
		return this.sessionService.destroySession(req)
	}
}
