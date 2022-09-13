import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class UpdateUserDto {
	@IsNumber()
	@IsNotEmpty()
	public sub: number;

	@IsString()
	@IsNotEmpty()
	public login: string;

	@IsString()
	@IsNotEmpty()
	public iat: string;

	@IsString()
	@IsNotEmpty()
	public exp: string;
}
