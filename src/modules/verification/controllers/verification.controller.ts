import {
	Body,
	Controller,
	Get,
	HttpCode,
	Post,
	Query,
	Req
} from '@nestjs/common'
import { IResult } from 'ua-parser-js'

import { ResendEmailDto } from '@/src/modules/verification/dto/resend-email.dto'
import { VerificationDto } from '@/src/modules/verification/dto/verification.dto'
import { UserAgent } from '@/src/shared/decorators/user-agent.decorator'

import { VerificationService } from '../services/verification.service'

@Controller('verification')
export class VerificationController {
	constructor(private readonly verificationService: VerificationService) {}

	@HttpCode(200)
	@Get('verify')
	async verify(
		@Req() req,
		@Query() dto: VerificationDto,
		@UserAgent() userAgent: IResult
	) {
		return this.verificationService.verify(req, dto, userAgent)
	}

	@HttpCode(200)
	@Post('resend-Verify')
	async resendVerify(@Body() dto: ResendEmailDto) {
		return this.verificationService.resendEmail(dto)
	}
}
