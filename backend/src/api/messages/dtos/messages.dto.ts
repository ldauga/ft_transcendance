import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

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

	@IsString()
	public text: string;
}
