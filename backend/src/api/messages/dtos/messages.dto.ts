import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class MessagesDto {
	@IsNumber()
	@IsNotEmpty()
	public id_sender: number;

	@IsNumber()
	@IsNotEmpty()
	public id_receiver: number;

	@IsString()
	public login_sender: string;

	@IsString()
	public login_receiver: string;

	@IsBoolean()
	public userOrRoom: boolean;

	@IsNumber()
	public room_id: number;

	@IsString()
	public room_name: string;

	@IsString()
	public text: string;

	@IsString()
	public year: string;

	@IsString()
	public month: string;

	@IsString()
	public day: string;

	@IsString()
	public hour: string;

	@IsString()
	public minute: string;
}
