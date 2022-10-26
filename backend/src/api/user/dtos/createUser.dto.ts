import { IsNotEmpty, IsString } from 'class-validator';

export class CreateUserDto {
	@IsString()
	@IsNotEmpty()
	public nickname: string;

	@IsString()
	@IsNotEmpty()
	public login: string;

	@IsString()
	@IsNotEmpty()
	public image_url: string;
}
