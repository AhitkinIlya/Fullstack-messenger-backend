import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { AccountModule } from '@/src/modules/account/account.module'
import { AuthModule } from '@/src/modules/auth/auth.module'
import { SessionModule } from '@/src/modules/session/session.module'
import { IS_DEV_ENV } from '@/src/shared/utils/is-dev.util'

import { PrismaModule } from './prisma/prisma.module'
import { RedisModule } from './redis/redis.module'

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			ignoreEnvFile: !IS_DEV_ENV
		}),
		PrismaModule,
		RedisModule,
		AuthModule,
		AccountModule,
		SessionModule
	]
})
export class CoreModule {}
