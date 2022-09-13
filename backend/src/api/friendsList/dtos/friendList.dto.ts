import { IsBoolean, IsNotEmpty, IsNumber } from 'class-validator';

export class FriendListDto {
	@IsNumber()
	@IsNotEmpty()
	public id_user1: number;

	@IsNumber()
	@IsNotEmpty()
	public id_user2: number;

}
