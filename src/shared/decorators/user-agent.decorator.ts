import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { IResult, UAParser } from 'ua-parser-js'

export const UserAgent = createParamDecorator(
	(
		data: keyof IResult | undefined,
		ctx: ExecutionContext
	): IResult | IResult[keyof IResult] => {
		const request = ctx.switchToHttp().getRequest()
		const userAgent = request.headers['user-agent'] || ''
		const parser = new UAParser(userAgent)
		const result = parser.getResult()

		return data ? result[data] : result
	}
)
