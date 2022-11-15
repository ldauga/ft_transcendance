import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class GetUserDto {
    @IsNumber()
    @IsNotEmpty()
    public id: number;

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
    public profile_pic?: string;

    @IsBoolean()
    @IsNotEmpty()
    public isTwoFactorAuthenticationEnabled: boolean;

    @IsBoolean()
    @IsNotEmpty()
    public isFirstConnection: boolean;

    @IsBoolean()
    @IsNotEmpty()
    public errorNickname: boolean;
}
