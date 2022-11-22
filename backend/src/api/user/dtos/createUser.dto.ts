import { IsNotEmpty, IsString } from 'class-validator';

export class CreateUserDto {

	@IsString()
	@IsNotEmpty()
	public login: string;

	@IsString()
	@IsNotEmpty()
	public image: string;
}
