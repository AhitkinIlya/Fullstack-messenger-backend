import { Module } from '@nestjs/common'

import { AuthController } from '@/src/modules/auth/controllers/auth.controller'
import { AuthService } from '@/src/modules/auth/services/auth.service'
import { PasswordService } from '@/src/modules/auth/services/password.service'
import {SessionModule} from "@/src/modules/session/session.module";

@Module({
    imports: [SessionModule],
	controllers: [AuthController],
	providers: [AuthService, PasswordService]
})
export class AuthModule {}
