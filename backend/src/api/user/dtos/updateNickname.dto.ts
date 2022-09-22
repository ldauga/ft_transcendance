import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class UpdateNicknameDto {
	@IsNumber()
	@IsNotEmpty()
	public id: number;

	@IsString()
	@IsNotEmpty()
	public nickname: string;
}
