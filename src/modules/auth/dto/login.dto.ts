import { IsNotEmpty, IsString, MinLength } from 'class-validator'

export class LoginDto {
	@IsString()
	@IsNotEmpty()
	login: string

	@MinLength(6, {
		message: 'Пароль должен содержать не менее 6 символов!'
	})
	@IsNotEmpty({ message: 'Пароль не может быть пустым' })
	@IsString({
		message: 'Пароль обязателен'
	})
	password: string
}
