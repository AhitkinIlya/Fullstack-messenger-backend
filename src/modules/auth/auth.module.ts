import { Module } from '@nestjs/common'

import { AuthController } from '@/src/modules/auth/controllers/auth.controller'
import { AuthService } from '@/src/modules/auth/services/auth.service'
import { PasswordService } from '@/src/modules/auth/services/password.service'
import { VerificationService } from '@/src/modules/verification/services/verification.service'

@Module({
	controllers: [AuthController],
	providers: [AuthService, PasswordService, VerificationService]
})
export class AuthModule {}
