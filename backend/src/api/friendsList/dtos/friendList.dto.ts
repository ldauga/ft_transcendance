import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class FriendListDto {
	@IsNumber()
	@IsNotEmpty()
	public id_user1: number;

	@IsNumber()
	@IsNotEmpty()
	public id_user2: number;

	@IsString()
	@IsNotEmpty()
	public login_user1: string;

	@IsString()
	@IsNotEmpty()
	public login_user2: string;

}
