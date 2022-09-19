import { Logger, Injectable, UnauthorizedException, BadRequestException, Req } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { UserService } from '../user/user.service';
import { UserEntity } from '../user/user.entity';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { authenticator } from 'otplib';
import { toDataURL } from 'qrcode';
import { GetUserDto } from '../user/dtos/getUser.dto';

@Injectable()
export class AuthService {
	constructor(
		private userServices: UserService,
		private http: HttpService,
		private jwtService: JwtService
	  ) {}

	private readonly clientId: string = process.env.API_UID;
	private readonly clientSecret: string = process.env.API_SECRET;
	private readonly API_authorizationURI: string = process.env.API_authorizationURI;
	private readonly redirectURI: string = process.env.API_redirectURI;
	private readonly endpoint: string = process.env.API_endpoint;
	private accessToken: string;
	private headers: { Authorization: string };
	private logger: Logger = new Logger('AuthService');

	/*
    *   @query - contient la variable 'code' reçue via la méthode GET permettant d'identifier l'utilisateur qui s'est connecté
    *   @token - contient le retour de la requête en méthode POST, afin de récupérer "l'acccess_token"
    *   @access_token - token permettant d'effectuer des requêtes sur l'API 42
    *   @data - contient le resultat de la requête permettant d'obtenir un profil Intra 42
    *
    *   returns: @accessToken
    *
    *   Récupère les informations de l'utilisateur venant de se log avec l'Intra 42 et créer un profil s'il n'existe pas.
    *   La fonction retourne un "accessToken", qui devra être transmis aux routes protégées afin d'effectuer des requêtes.
    */

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
				user = await this.userServices.createUser(data);
			}
			return this.signUser(user);
		} catch(error) {
			this.logger.error(error);
			return null;
		}
	}

	async loginSans42(login: string)
	{
		let user = await this.userServices.getUserByLogin(login);

		if (!user) {
			user = await this.userServices.createUserSans42(login);
		}
		return this.signUser(user);
	}

	async generateTwoFactorAuthenticationSecret(refreshToken: string, request: Request) {
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

	signUser(user: UserEntity) {
		return this.jwtService.sign({
			sub: user.id,
			login: user.login,
		});
	}
}
