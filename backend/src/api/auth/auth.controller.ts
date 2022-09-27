import { BadRequestException, Body, ConsoleLogger, Controller, Get, Param, Post, Query, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { Request, Response } from 'express';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
	constructor(
		private authService: AuthService,
		private userServices: UserService
	) { }

	@Get('/login')
	async login(@Query() query, @Res({ passthrough: true }) res: Response) {
		const accessToken = await this.authService.login(query);
		const refreshToken = await this.userServices.getRefreshToken(accessToken);
		const secretData = {
			accessToken,
			refreshToken
		};
		res.cookie('auth-cookie', secretData, { httpOnly: false });
		res.status(302).redirect(`http://localhost:3000/Login/Callback`);
		//Gestion d erreur si la personne refuse la connexion sur l'intra
	}

	@Get('/loginSans42/:login')
	async loginSans42(@Param('login') login: string, @Res({ passthrough: true }) res: Response) {
		const accessToken = await this.authService.loginSans42(login);
		const refreshToken = await this.userServices.getRefreshToken(accessToken);
		const secretData = {
			accessToken,
			refreshToken
		};
		res.cookie('auth-cookie', secretData, { httpOnly: false });
		res.status(302).redirect(`http://localhost:3000/Login/Callback`);
	}

	@Get('2fa/generate')
	async register(@Res() response: Response, @Req() request: Request) {
		const user = await this.userServices.getUserByRefreshToken(request.cookies['auth-cookie'].refreshToken);
		if (!user)
			throw new BadRequestException('User not found')
		const refreshToken = request.cookies['auth-cookie'].refreshToken;
		const { otpAuthUrl } = await this.authService.generateTwoFactorAuthenticationSecret(refreshToken, request);
		return response.json(await this.authService.generateQrCodeDataURL(otpAuthUrl));
	}

	@Get('2fa/verify/:code')
	async verifyCode(@Param('code') code: string, @Req() request, @Body() body) {
		const user = await this.userServices.getUserByRefreshToken(request.cookies['auth-cookie'].refreshToken);
		if (!user)
			throw new BadRequestException('User not found')
		const totpsecret = await this.userServices.getTotpSecret(user.login);
		const isCodeValid =
			this.authService.isTwoFactorAuthenticationCodeValid(
				code,
				totpsecret,
			);
		if (!isCodeValid) {
			throw new UnauthorizedException('Wrong authentication code');
		}
		return isCodeValid;
	}


	@Get('2fa/turn-on/:code')
	async turnOnTwoFactorAuthentication(@Param('code') code: string, @Req() request, @Body() body) {
		const user = await this.userServices.getUserByRefreshToken(request.cookies['auth-cookie'].refreshToken)
		if (!user)
			throw new BadRequestException('User not found');
		const totpsecret = await this.userServices.getTotpSecret(user.login);
		const isCodeValid =
			this.authService.isTwoFactorAuthenticationCodeValid(
				code,
				totpsecret,
			);
		if (!isCodeValid) {
			throw new UnauthorizedException('Wrong authentication code');
		}
		await this.userServices.turnOnTwoFactorAuthentication(user.login);
		return 
	}

	@Get('2fa/turn-off/')
	async turnOffTwoFactorAuthentication(@Req() request, @Body() body) {
		const user = await this.userServices.getUserByRefreshToken(request.cookies['auth-cookie'].refreshToken)
		if (!user)
			throw new BadRequestException('User not found');
		await this.userServices.turnOffTwoFactorAuthentication(user.login);
	}

	@Get('/refresh')
	@UseGuards(AuthGuard('refresh'))
	async refresh(@Query() query, @Res({ passthrough: true }) res: Response) {
		//await this.authService.createRefreshToken(query);
	}

}
