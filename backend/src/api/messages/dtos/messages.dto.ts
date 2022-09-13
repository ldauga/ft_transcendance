import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class MessagesDto {
	@IsNumber()
	@IsNotEmpty()
	public id_sender: number;

	@IsString()
	public login_sender: string;

	@IsNumber()
	@IsNotEmpty()
	public id_receiver: number;

	@IsString()
	public login_receiver: string;

	@IsString()
	public text: string;
}

// import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

// export class MessagesDto {
// 	@IsNumber()
// 	@IsNotEmpty()
// 	public id_user1: number;

// 	@IsNumber()
// 	@IsNotEmpty()
// 	public score_u1: number;

// 	@IsNumber()
// 	@IsNotEmpty()
// 	public id_user2: number;

// 	@IsNumber()
// 	@IsNotEmpty()
// 	public score_u2: number;

// 	@IsNumber()
// 	@IsNotEmpty()
// 	public winner_id: number;

// 	@IsString()
// 	public text: string;
// }
