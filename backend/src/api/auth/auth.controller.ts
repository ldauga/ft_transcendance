import { BadRequestException, Body, ConsoleLogger, Controller, Get, Param, Post, Query, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { Request, Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { isConstructorDeclaration } from 'typescript';

@Controller('auth')
export class AuthController {
	constructor(
		private authService: AuthService,
		private userServices: UserService
	) {}

	@Get('/login')
	async login(@Query() query, @Res({ passthrough: true }) res: Response) {
		if (query.error == "access_denied") {
			res.status(401).redirect(`http://10.3.3.5:3000/`);
			return ;
		}

		const accessToken = await this.authService.login(query);
		const refreshToken = await this.userServices.getRefreshToken(accessToken);
		const secretData = {
			accessToken,
			refreshToken
		};

		res.cookie('auth-cookie', secretData, { httpOnly: true });
		res.status(302).redirect(`http://10.3.3.5:3000/Login/Callback`);
	}

	@Get('/loginSans42/:login')
	async loginSans42(@Param('login') login: string, @Res({ passthrough: true }) res: Response) {
		const accessToken = await this.authService.loginSans42(login);
		const refreshToken = await this.userServices.getRefreshToken(accessToken);
		const secretData = {
			accessToken,
			refreshToken
		};
		
		res.cookie('auth-cookie', secretData, { httpOnly: true });
		res.status(302).redirect(`http://10.3.3.5:3000/Login/Callback`);
	}

	@Get('2fa/generate')
	@UseGuards(AuthGuard('jwt'))
	async register(@Res() response: Response, @Req() request) {
		const user = await this.userServices.getUserByRefreshToken(request.cookies['auth-cookie'].refreshToken);
		
		if (!user)
			throw new BadRequestException('User not found')
		
		const refreshToken = request.cookies['auth-cookie'].refreshToken;
		const { otpAuthUrl } = await this.authService.generateTwoFactorAuthenticationSecret(refreshToken, request);
		return response.json(await this.authService.generateQrCodeDataURL(otpAuthUrl));
	}

	@Get('2fa/verify/:code')
	@UseGuards(AuthGuard('jwt'))
	async verifyCode(@Param('code') code: string, @Req() request) {
		const user = await this.userServices.getUserByRefreshToken(request.cookies['auth-cookie'].refreshToken);
		
		if (!user)
			throw new BadRequestException('User not found')
		
		const totpsecret = await this.userServices.getTotpSecret(user.login);
		const isCodeValid = this.authService.isTwoFactorAuthenticationCodeValid(
			code,
			totpsecret,
		);
		
		if (!isCodeValid) {
			throw new UnauthorizedException('Wrong authentication code');
		}
		
		return isCodeValid;
	}

	@Get('2fa/turn-on/:code')
	@UseGuards(AuthGuard('jwt'))
	async turnOnTwoFactorAuthentication(@Param('code') code: string, @Req() request) {
		const user = await this.userServices.getUserByRefreshToken(request.cookies['auth-cookie'].refreshToken)
		
		if (!user)
			throw new BadRequestException('User not found');
		const totpsecret = await this.userServices.getTotpSecret(user.login);
		const isCodeValid = this.authService.isTwoFactorAuthenticationCodeValid(
				code,
				totpsecret,
		);

		if (!isCodeValid) {
			throw new UnauthorizedException('Wrong authentication code');
		}
		
		return await this.userServices.turnOnTwoFactorAuthentication(user.login);
	}

	@Get('2fa/turn-off/')
	@UseGuards(AuthGuard('jwt'))
	async turnOffTwoFactorAuthentication(@Req() request) {
		const user = await this.userServices.getUserByRefreshToken(request.cookies['auth-cookie'].refreshToken)
		if (!user)
			throw new BadRequestException('User not found');
		return await this.userServices.turnOffTwoFactorAuthentication(user.login);
	}

	@Get('/refresh/')
	@UseGuards(AuthGuard('refresh'))
	async refresh(@Req() request, @Res({ passthrough: true }) res: Response) {
		const accessToken = await this.authService.createAccessTokenFromRefresh(request);
		let refreshToken = request?.cookies["auth-cookie"].refreshToken;
		const secretData = {
			accessToken,
			refreshToken
		};
		res.cookie('auth-cookie', secretData, { httpOnly: true });
	}
}
