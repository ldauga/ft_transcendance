import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class GetUserDto {
	@IsString()
	@IsNotEmpty()
	public login: string;

    @IsString()
	@IsNotEmpty()
	public nickname: string;

    @IsNumber()
    @IsNotEmpty()
    public wins: number;

    @IsNumber()
    @IsNotEmpty()
    public losses: number;

    @IsNumber()
    @IsNotEmpty()
    public rank: number;

    @IsString()
    //@IsNotEmpty()
    public profile_pic?: string;
}
