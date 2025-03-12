import { Body, Controller, HttpCode, Post, Req } from '@nestjs/common'

import { LoginDto } from '@/src/modules/auth/dto/login.dto'
import { RegisterDto } from '@/src/modules/auth/dto/register.dto'
import { AuthService } from '@/src/modules/auth/services/auth.service'

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
	async login(@Body() dto: LoginDto, @Req() req) {
		return this.authService.login(req, dto)
	}

	@HttpCode(200)
	@Post('logout')
	async logout(@Req() req) {
		return this.authService.logout(req)
	}
}
