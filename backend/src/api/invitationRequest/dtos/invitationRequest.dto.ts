import { IsBoolean, IsNotEmpty, IsNumber } from 'class-validator';

export class InvitationRequestDto {
	@IsNumber()
	@IsNotEmpty()
	public id_user1: number;

	@IsNumber()
	@IsNotEmpty()
	public id_user2: number;

	@IsBoolean()
	public user1_accept: boolean;

	@IsBoolean()
	public user2_accept: boolean;

}
