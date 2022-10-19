import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class RoomsDto {
	@IsString()
	@IsNotEmpty()
	public name: string;

	@IsString()
	public description: string;

	@IsString()
	public password: string;

	@IsNumber()
	public identifiant: number;

	@IsNumber()
	@IsNotEmpty()
	public owner_id: number;

	@IsBoolean()
	public publicOrPrivate: boolean;

	@IsBoolean()
	public passwordOrNot: boolean;

}
