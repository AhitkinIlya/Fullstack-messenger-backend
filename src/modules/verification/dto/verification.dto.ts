import { IsNotEmpty, IsUUID } from 'class-validator'

export class VerificationDto {
	@IsUUID('4')
	@IsNotEmpty()
	token: string
}
