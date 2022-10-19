import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class BlackListDto {
	@IsNumber()
	@IsNotEmpty()
	public id_sender: number;

	@IsNumber()
	@IsNotEmpty()
	public id_banned: number;

	@IsString()
	public login_sender: string;

	@IsString()
	public login_banned: string;

	@IsBoolean()
	public userOrRoom: boolean;

	@IsNumber()
	@IsNotEmpty()
	public room_id: number;

	@IsString()
	public room_name: string;

	@IsString()
	public cause: string;

	@IsNumber()
	@IsNotEmpty()
	public date: number;

	@IsBoolean()
	public alwaysOrNot: boolean;

	@IsNumber()
	public timer: number;
}
