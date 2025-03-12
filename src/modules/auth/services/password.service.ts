import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as bcrypt from 'bcrypt'

@Injectable()
export class PasswordService {
	constructor(private configService: ConfigService) {}

	get SALT_ROUNDS(): number {
		return Number(this.configService.get<number>('SALT_ROUNDS')) || 12
	}

	// Хэширование пароля
	async hashPassword(password: string): Promise<string> {
		return await bcrypt.hash(password, this.SALT_ROUNDS)
	}

	// Сравнение пароля с хэшем
	async comparePasswords(password: string, hash: string): Promise<boolean> {
		return await bcrypt.compare(password, hash)
	}
}
