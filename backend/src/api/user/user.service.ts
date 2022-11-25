import { Logger, Injectable, Req, UseGuards, BadRequestException, UnauthorizedException, ConsoleLogger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dtos/createUser.dto';
import { UpdateUserDto } from './dtos/updateUser.dto';
import { UserEntity } from './user.entity';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';
import { GetUserDto } from './dtos/getUser.dto';
import { UpdateWinLooseDto } from './dtos/updateWinLoose.dto';

@Injectable()
export class UserService {
	constructor(
		@InjectRepository(UserEntity)
		private readonly userRepository: Repository<UserEntity>,
		private jwtService: JwtService
	) { }

	private logger: Logger = new Logger('UserService');

	public getAllUsers(): Promise<UserEntity[]> {
		return this.userRepository.find();
	}

	async getUserById(id: number): Promise<UserEntity> {
		if (id == undefined)
			return null;
		const user = await this.userRepository.findOneBy({ id: id });
		if (!user)
			return null;
		return user;
	}

	async getUserByLogin(login: string): Promise<UserEntity> {
		if (!login)
			return null;
		const user = await this.userRepository.findOneBy({ login: login });
		if (!user)
			return null;
		return user;
	}

	async getUserByNickname(nickname: string): Promise<UserEntity> {
		const user = await this.userRepository.findOneBy({ nickname: nickname });
		if (!user)
			return null;
		return user;
	}

	async getUserByRefreshToken(signedRefreshToken: any): Promise<GetUserDto> {
		if (signedRefreshToken === undefined)
			throw new UnauthorizedException('Token not found');

		var user: any;

		if (signedRefreshToken.refreshToken)
			user = await this.userRepository.findOneBy({ signedRefreshToken: signedRefreshToken.refreshToken });
		else if (signedRefreshToken)
			user = await this.userRepository.findOneBy({ signedRefreshToken: signedRefreshToken });

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
			isTwoFactorAuthenticationEnabled: user.isTwoFactorAuthenticationEnabled,
			isFirstConnection: user.isFirstConnection,
			errorNickname: user.errorNickname
		}
		return retUser;
	}

	async getTotpSecret(login: string) {
		const user = await this.userRepository.findOneBy({ login: login })
		if (!user)
			return null;
		return user.totpsecret;
	}

	async getUserByToken(refreshToken: any): Promise<UserEntity> {
		const user = await this.userRepository.findOneBy({ refreshToken: refreshToken });
		if (!user)
			return null;
		return user;
	}

	async createUser(body: CreateUserDto): Promise<UserEntity> {
		const response = await this.userRepository.findOneBy({ login: body.login });
		if (response)
			return null;

		const user: UserEntity = new UserEntity();

		user.nickname = body.login;
		user.login = body.login;
		user.rank = 800;
		user.profile_pic = body.image;

		return this.userRepository.save(user);
	}

	async updateRefreshToken(body: UpdateUserDto, refreshToken: any) {
		let user = await this.getUserById(body.sub);
		const decodedRefreshToken = this.jwtService.decode(refreshToken)
		if (user) {
			user!.refreshToken = decodedRefreshToken['token'];
			user!.signedRefreshToken = refreshToken;
			user!.refreshTokenIAT = decodedRefreshToken['iat'];
			user!.refreshTokenExp = decodedRefreshToken['exp'];
			this.userRepository.save(user);
			return user;
		}
		return null;
	}

	async updateWinLoose(body: UpdateWinLooseDto) {
		let user = await this.getUserById(body.id);
		if (user) {
			if (body.win)
				user!.wins++;
			else
				user!.losses++;
			this.userRepository.save(user);
			return user;
		}
		return null;
	}

	async updateNickname(login: string, nickname: string): Promise<GetUserDto> {
		const user = await this.getUserByLogin(login)

		if (!user)
			return null;
		if (nickname.length < 3 || nickname.length > 8)
			throw new BadRequestException('Nickname too short');
		if (nickname.search("^[a-zA-Z0-9_]*$") == -1)
			throw new BadRequestException('No special char');
		if (user.nickname == nickname)
			throw new BadRequestException('Cannot set identical nickname');
		if (await this.getUserByNickname(nickname))
			throw new BadRequestException('Nickname already used');
		const res = await this.getUserByLogin(nickname)
		if (res && res?.login != user.login)
			throw new BadRequestException('Cannot use someone\'s login as a nickname');
		if ((await this.getAllUsers()).find(user => user.nickname.toLowerCase() == nickname.toLowerCase()) != undefined)
			throw new BadRequestException('Nickname already used');

		user.nickname = nickname;
		this.userRepository.save(user);

		const retUser: GetUserDto = {
			id: user.id,
			login: user.login,
			nickname: user.nickname,
			wins: user.wins,
			losses: user.losses,
			rank: user.rank,
			profile_pic: user.profile_pic,
			isTwoFactorAuthenticationEnabled: user.isTwoFactorAuthenticationEnabled,
			isFirstConnection: user.isFirstConnection,
			errorNickname: user.errorNickname
		}
		return retUser;
	}

	async checkMagicNumber(type: string, buffer: Buffer) {
		if (type == 'image/jpg' || type == 'image/jpeg') {
			if (buffer.toString('hex').length < "ffd8ff".length) {
				return false;
			}
			if (buffer.toString('hex').substring(0, 6) == "ffd8ff")
				return true;
		}
		else if (type == 'image/png') {
			if (buffer.toString('hex').length < "89504e47".length) {
				return false;
			}
			if (buffer.toString('hex').substring(0, 8) == "89504e47")
				return true;
		}
		return false;
	}

	async updateProfilePic(refreshToken, filename: string): Promise<GetUserDto> {
		const user = await this.getUserByRefreshToken(refreshToken);
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
			isTwoFactorAuthenticationEnabled: user.isTwoFactorAuthenticationEnabled,
			isFirstConnection: user.isFirstConnection,
			errorNickname: user.errorNickname
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
		if (!user)
			return null;
		user.totpsecret = secret;
		this.userRepository.save(user);
	}

	async turnOnTwoFactorAuthentication(login: string): Promise<GetUserDto> {

		const user = await this.getUserByLogin(login)

		if (!user)
			return null;

		user.isTwoFactorAuthenticationEnabled = true;
		this.userRepository.save(user);

		const retUser: GetUserDto = {
			id: user.id,
			login: user.login,
			nickname: user.nickname,
			wins: user.wins,
			losses: user.losses,
			rank: user.rank,
			profile_pic: user.profile_pic,
			isTwoFactorAuthenticationEnabled: user.isTwoFactorAuthenticationEnabled,
			isFirstConnection: user.isFirstConnection,
			errorNickname: user.errorNickname
		}
		return retUser;
	}

	async turnOffTwoFactorAuthentication(login: string): Promise<GetUserDto> {
		const user = await this.getUserByLogin(login)

		if (!user)
			return null;

		user.isTwoFactorAuthenticationEnabled = false;
		this.userRepository.save(user);

		const retUser: GetUserDto = {
			id: user.id,
			login: user.login,
			nickname: user.nickname,
			wins: user.wins,
			losses: user.losses,
			rank: user.rank,
			profile_pic: user.profile_pic,
			isTwoFactorAuthenticationEnabled: user.isTwoFactorAuthenticationEnabled,
			isFirstConnection: user.isFirstConnection,
			errorNickname: user.errorNickname
		}
		return retUser;
	}

	signRefreshToken(refreshToken: any) {
		return this.jwtService.sign({
			sub: refreshToken.sub,
			login: refreshToken.login,
			token: refreshToken
		});
	}

	async firstConnection(refreshToken: any) {
		const user = await this.getUserByRefreshToken(refreshToken)

		if (!user)
			return null

		user.isFirstConnection = false

		this.userRepository.save(user)

		const retUser: GetUserDto = {
			id: user.id,
			login: user.login,
			nickname: user.nickname,
			wins: user.wins,
			losses: user.losses,
			rank: user.rank,
			profile_pic: user.profile_pic,
			isTwoFactorAuthenticationEnabled: user.isTwoFactorAuthenticationEnabled,
			isFirstConnection: user.isFirstConnection,
			errorNickname: user.errorNickname
		}
		return retUser;
	}

	async checkErrorNickname(login: string) {
		let user = await this.getUserByNickname(login)

		if (user) {
			user!.nickname = user!.login;
			user!.errorNickname = true;
			this.userRepository.save(user);
		}
		return null;
	}
}
