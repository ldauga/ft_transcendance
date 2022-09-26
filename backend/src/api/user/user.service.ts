import { Logger, Injectable, Req, UseGuards, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dtos/createUser.dto';
import { UpdateUserDto } from './dtos/updateUser.dto';
import { UserEntity } from './user.entity';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';
import { GetUserDto } from './dtos/getUser.dto';
import { UpdateWinLooseDto } from './dtos/updateWinLoose.dto';
import { UpdateNicknameDto } from './dtos/updateNickname.dto';
	
@Injectable()
export class UserService {
	constructor(
		@InjectRepository(UserEntity)
		private readonly userRepository: Repository<UserEntity>,
		private jwtService: JwtService
	) {}

	private logger: Logger = new Logger('UserService');

	public getAllUsers(): Promise<UserEntity[]> {
		return this.userRepository.find();
	}

	async getUserById(id: number): Promise<UserEntity> {
		const user = await this.userRepository.findOneBy( {id: id} );
		if (!user)
			return null;
		return user;
	}

	async getUserByLogin(login: string): Promise<UserEntity> {
		const user = await this.userRepository.findOneBy( {login: login} );
		if (!user)
			return null;
		return user;
	}

	async getUserByRefreshToken(signedRefreshToken: any): Promise<GetUserDto> {
		var user: any;
		if (signedRefreshToken.refreshToken)
			user = await this.userRepository.findOneBy( {signedRefreshToken: signedRefreshToken.refreshToken});
		else
			user = await this.userRepository.findOneBy( {signedRefreshToken: signedRefreshToken});
		
		if (!user)
			throw new BadRequestException('User not found');
		const retUser = {
			id: user.id,
			login: user.login,
			nickname: user.nickname,
			wins: user.wins,
			losses: user.losses,
			rank: user.rank,
			profile_pic: user.profile_pic,
			isTwoFactorAuthenticationEnabled: user.isTwoFactorAuthenticationEnabled
		}
		return retUser;
	}

	async getTotpSecret(login: string) {
		const user = await this.userRepository.findOneBy( {login: login})
		if (!user)
			return null;
		return user.totpsecret;
	}

	async getUserByToken(refreshToken: any): Promise<GetUserDto> {
		const user = await this.userRepository.findOneBy( { refreshToken: refreshToken} );
		if (!user)
			return null;
		const retUser = {
			id: user.id,
			login: user.login,
			nickname: user.nickname,
			wins: user.wins,
			losses: user.losses,
			rank: user.rank,
			profile_pic: user.profile_pic,
			isTwoFactorAuthenticationEnabled: user.isTwoFactorAuthenticationEnabled
		}
		return retUser;
	}

	async createUser(body: CreateUserDto): Promise<UserEntity> {
		const response = await this.userRepository.findOneBy( {login: body.login} );
		if (response)
			return null;

		const user: UserEntity = new UserEntity();

		user.nickname = body.login;
		user.login = body.login;
		user.profile_pic = `https://cdn.intra.42.fr/users/${user.login}.jpg`;

		return this.userRepository.save(user);
	}

	async createUserSans42(login: string): Promise<UserEntity> {
		const response = await this.userRepository.findOneBy( {login: login} );
		if (response)
			return null;

		const user: UserEntity = new UserEntity();

		user.nickname = login;
		user.login = login;
		user.profile_pic = `https://cdn.intra.42.fr/users/${login}.jpg`;

		return this.userRepository.save(user);
	}

	async updateRefreshToken(body: UpdateUserDto, refreshToken: any) {
		let user = await this.getUserById(body.sub);
		const decodedRefreshToken = this.jwtService.decode(refreshToken)
		if (user) {	
			user.refreshToken = decodedRefreshToken['token'];
			user.signedRefreshToken = refreshToken;
			user.refreshTokenIAT = decodedRefreshToken['iat'];
			user.refreshTokenExp = decodedRefreshToken['exp'];
			this.userRepository.save(user);
			return user;
		}
		return null;
	}

	async updateWinLoose(body: UpdateWinLooseDto) {
		let user = await this.getUserById(body.id);
		if (user) {
			if (body.win)
				user.wins++;
			else
				user.losses++;
				this.userRepository.save(user);
			return user;
		}
	}

	async updateNickname(body: UpdateNicknameDto): Promise<GetUserDto> {
		const user = await this.getUserById(body.id)
		if (!user)
			return null;
		if (user.nickname == body.nickname)
			throw new BadRequestException('Cannot set identical nickname');
		
		user.nickname = body.nickname;
		this.userRepository.save(user);

		const retUser: GetUserDto = {
			id: user.id,
			login: user.login,
			nickname: user.nickname,
			wins: user.wins,
			losses: user.losses,
			rank: user.rank,
			profile_pic: user.profile_pic,
			isTwoFactorAuthenticationEnabled: user.isTwoFactorAuthenticationEnabled
		}
		return retUser;
	}

	async updateProfilePic(body, filename: string): Promise<GetUserDto> {
		const user = await this.getUserById(body.id);
		console.log(user);
		if (!user)
			return null;
		
		user.profile_pic = `${process.env.BASE_URL}/user/profilePic/:${filename}`;
		this.userRepository.save(user);
		const retUser: GetUserDto = {
			id: user.id,
			login: user.login,
			nickname: user.nickname,
			wins: user.wins,
			losses: user.losses,
			rank: user.rank,
			profile_pic: user.profile_pic,
			isTwoFactorAuthenticationEnabled: user.isTwoFactorAuthenticationEnabled
		}
		return retUser;
	}

	async getRefreshToken(accessToken: string) {
		try {
			const decodedJwtAccessToken = this.jwtService.decode(accessToken);

			const data = JSON.parse(JSON.stringify(decodedJwtAccessToken));
			const refreshToken = randomUUID();

			const user = await this.getUserById(data.sub);

			if (!user)
				return null;
			
			var signedRefreshToken = this.signRefreshToken(refreshToken)
			await this.updateRefreshToken(data, signedRefreshToken);

			return signedRefreshToken;
		} catch (error) {
			this.logger.error(error);
			return null;
		}
	}

	async setTwoFactorAuthenticationSecret(secret: string, userId: number) {
		const user = await this.getUserById(userId);
		console.log(user);
		if (!user)
			return null;
		user.totpsecret = secret;
		this.userRepository.save(user);
	}

	async turnOnTwoFactorAuthentication(login: string) {
		const user = await this.getUserByLogin(login)
		if (!user)
			return null;
		user.isTwoFactorAuthenticationEnabled = true;
		this.userRepository.save(user);
	}

	async turnOffTwoFactorAuthentication(login: string) {
		const user = await this.getUserByLogin(login)
		if (!user)
			return null;
		user.isTwoFactorAuthenticationEnabled = false;
		this.userRepository.save(user);
	}

	signRefreshToken(refreshToken: any) {
		return this.jwtService.sign({
			sub: refreshToken.sub,
			login: refreshToken.login,
			token: refreshToken
		});
	}
}
