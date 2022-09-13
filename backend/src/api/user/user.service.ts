import { Logger, Injectable, Req } from '@nestjs/common';
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

	async getUserByRefreshToken(refreshToken: any): Promise<GetUserDto> {
		const user = await this.userRepository.findOneBy( {refreshToken: refreshToken} );
		if (!user)
			return null;
		const retUser = {
			id: user.id,
			login: user.login,
			nickname: user.nickname,
			wins: user.wins,
			losses: user.losses,
			rank: user.rank,
			profile_pic: user.profile_pic
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
		if (user) {
			user.refreshToken = refreshToken;
			user.refreshTokenIAT = body.iat;
			user.refreshTokenExp = body.exp
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
		return null;
	}

	async getRefreshTokens(accessToken: string) {
		try {
			const decodedJwtAccessToken = this.jwtService.decode(accessToken);


			const data = JSON.parse(JSON.stringify(decodedJwtAccessToken));
			const refreshToken = randomUUID(); //hash

			const user = await this.getUserById(data.sub);

			
			
			var signedRefreshToken =  this.signRefreshToken(refreshToken)
			await this.updateRefreshToken(data, signedRefreshToken);

			return signedRefreshToken;
		} catch (error) {
			this.logger.error(error);
			return null;
		}
	}

	signRefreshToken(refreshToken: any) {
		return this.jwtService.sign({
			sub: refreshToken.sub,
			login: refreshToken.login
		});
	}
}
