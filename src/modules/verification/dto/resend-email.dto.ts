import { IsNotEmpty, IsString } from 'class-validator'

export class ResendEmailDto {
	@IsString()
	@IsNotEmpty()
	login: string
}
