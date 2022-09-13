import { IsBoolean, IsNotEmpty, IsNumber } from 'class-validator';

export class UpdateWinLooseDto {
	@IsNumber()
	@IsNotEmpty()
	public id: number;

	@IsBoolean()
	@IsNotEmpty()
	public win: boolean;
}
