import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class ParticipantsDto {
	@IsNumber()
	@IsNotEmpty()
	public user_id: number;

	@IsString()
	@IsNotEmpty()
	public user_login: string;

	@IsNumber()
	@IsNotEmpty()
	public room_id: number;

	@IsString()
	@IsNotEmpty()
	public room_name: string;

	@IsBoolean()
	public admin: boolean;

}
