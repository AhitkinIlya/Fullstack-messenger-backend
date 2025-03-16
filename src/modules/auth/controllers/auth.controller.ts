import { Body, Controller, HttpCode, Post, Req } from '@nestjs/common'
import { IResult } from 'ua-parser-js'

import { LoginDto } from '@/src/modules/auth/dto/login.dto'
import { RegisterDto } from '@/src/modules/auth/dto/register.dto'
import { AuthService } from '@/src/modules/auth/services/auth.service'
import { UserAgent } from '@/src/shared/decorators/user-agent.decorator'

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@HttpCode(200)
	@Post('register')
	async register(@Body() dto: RegisterDto) {
		return this.authService.register(dto)
	}

	@HttpCode(200)
	@Post('login')
	async login(
		@Body() dto: LoginDto,
		@Req() req,
		@UserAgent() userAgent: IResult
	) {
		return this.authService.login(req, dto, userAgent)
	}

	@HttpCode(200)
	@Post('logout')
	async logout(@Req() req) {
		return this.authService.logout(req)
	}
}
