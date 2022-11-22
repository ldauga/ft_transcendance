import { Logger, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { UserService } from '../user/user.service';
import { UserEntity } from '../user/user.entity';
import { JwtService } from '@nestjs/jwt';
import { authenticator } from 'otplib';
import { toDataURL } from 'qrcode';

@Injectable()
export class AuthService {
	constructor(
		private userServices: UserService,
		private http: HttpService,
		private jwtService: JwtService
	) { }

	private readonly clientId: string = process.env.API_UID;
	private readonly clientSecret: string = process.env.API_SECRET;
	private readonly API_authorizationURI: string = process.env.API_authorizationURI;
	private readonly redirectURI: string = process.env.API_redirectURI;
	private readonly endpoint: string = process.env.API_endpoint;
	private accessToken: string;
	private headers: { Authorization: string };
	private logger: Logger = new Logger('AuthService');

	async login(req: any) {
		try {
			const token = this.http.post(`${this.API_authorizationURI}`,
				`grant_type=authorization_code&client_id=${this.clientId}&client_secret=${this.clientSecret}&code=${req.code}&redirect_uri=${this.redirectURI}`);
			this.accessToken = (await lastValueFrom(token)).data.access_token;
			this.headers = { Authorization: `Bearer ${this.accessToken}` };

			const { data } = await lastValueFrom(
				this.http.get(`${this.endpoint}/me`, {
					headers: this.headers,
				}),
			);

			let user = await this.userServices.getUserByLogin(data.login);

			if (!user) {
				this.userServices.checkErrorNickname(data.login)
				const body = { login: data.login, image: data.image.link}
				user = await this.userServices.createUser(body);
			}
			return this.signUser(user);
		} catch (error) {
			this.logger.error(error);
			return null;
		}
	}

	async generateTwoFactorAuthenticationSecret(refreshToken: string) {
		const secret = authenticator.generateSecret();
		const response = await this.userServices.getUserByRefreshToken(refreshToken);
		const otpAuthUrl = authenticator.keyuri(response.login, 'Trans en danse', secret);

		const user = await this.userServices.getUserByLogin(response.login);
		if (!user)
			return null;

		await this.userServices.setTwoFactorAuthenticationSecret(secret, user.id);

		return {
			secret,
			otpAuthUrl
		}
	}

	async generateQrCodeDataURL(otpAuthUrl: string) {
		return toDataURL(otpAuthUrl);
	}

	isTwoFactorAuthenticationCodeValid(twoFactorAuthenticationCode: string, totpsecret: string) {
		return authenticator.verify({
			token: twoFactorAuthenticationCode,
			secret: totpsecret,
		});
	}

	async createAccessTokenFromRefresh(request) {
		const decodedRefreshToken = this.jwtService.decode(request?.cookies["auth-cookie"].refreshToken)
		const user = await this.userServices.getUserByToken(decodedRefreshToken['token']);
		if (!user)
			return null;
		return this.signUser(user)
	}

	signUser(user: UserEntity) {
		return this.jwtService.sign({
			sub: user.id,
			login: user.login,
		});
	}
}
