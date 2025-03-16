import { applyDecorators, UseGuards } from '@nestjs/common'

import { SessionGuard } from '../guards/session.guard'

export function Auth() {
	return applyDecorators(UseGuards(SessionGuard))
}
