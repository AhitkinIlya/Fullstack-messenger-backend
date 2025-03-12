import {
	IsEmail,
	IsNotEmpty,
	IsString,
	Matches,
	MinLength
} from 'class-validator'

export class RegisterDto {
	@IsString()
	@IsNotEmpty()
	name: string

	@IsString()
	@IsNotEmpty()
	@Matches(/^[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*$/)
	username: string

	@IsString({
		message: 'Почта обязательна'
	})
	@IsEmail()
	email: string

	@IsNotEmpty({ message: 'Пароль не может быть пустым' })
	@MinLength(6, {
		message: 'Пароль должен содержать не менее 6 символов!'
	})
	@IsString({
		message: 'Пароль обязателен'
	})
	@Matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])/, {
		message:
			'Пароль должен содержать: 1 заглавную букву, 1 цифру, 1 спецсимвол'
	})
	password: string
}
