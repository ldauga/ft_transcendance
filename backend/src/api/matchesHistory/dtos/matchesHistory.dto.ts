import { IsNotEmpty, IsNumber } from 'class-validator';

export class MatchesHistoryDto {
	@IsNumber()
	@IsNotEmpty()
	public id_user1: number;

    @IsNumber()
	@IsNotEmpty()
	public score_u1: number;

	@IsNumber()
	@IsNotEmpty()
	public id_user2: number;

    @IsNumber()
	@IsNotEmpty()
	public score_u2: number;

    @IsNumber()
	@IsNotEmpty()
	public winner_id: number;
}
