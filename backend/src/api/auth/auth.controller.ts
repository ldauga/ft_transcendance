import { Controller, Get, Param, Query, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { Request, Response } from 'express';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
	constructor(
		private authService: AuthService,
		private userServices: UserService
	) {}

	@Get('/login')
		async login(@Query() query, @Res({ passthrough: true }) res: Response) {
		const accessToken = await this.authService.login(query);

		const refreshToken = await this.userServices.getRefreshTokens(accessToken);
		console.log('refresh: ', refreshToken);
		const secretData = {
			accessToken,
			refreshToken
		};
		console.log('login: ', secretData);

		res.cookie('auth-cookie', secretData, {httpOnly: false});
		//GESTION D ERREUR NECESSAIRE
		res.status(302).redirect(`http://localhost:3000/Login/Callback`);	
	}

	@Get('/loginSans42/:login')
		async loginSans42(@Param('login') login: string, @Res({ passthrough: true }) res: Response) {
		const accessToken = await this.authService.loginSans42(login);

		const refreshToken = await this.userServices.getRefreshTokens(accessToken);
		console.log('refresh: ', refreshToken);
		const secretData = {
			accessToken,
			refreshToken
		};
		console.log('login: ', secretData);

		res.cookie('auth-cookie', secretData, {httpOnly: false});
		//GESTION D ERREUR NECESSAIRE
		res.status(302).redirect(`http://localhost:3000/Login/Callback`);
	}	

	@Get('/getCookieRefreshToken')
	async getCookieRefreshToken(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
		console.log('getCookieRefreshToken');
		const token = await this.authService.getCookieRefreshToken(req);
		console.log(token);
		return token;
	}

	@Get('/refresh')
	@UseGuards(AuthGuard('jwt'))
	async refresh(@Query() query, @Res({ passthrough: true }) res: Response) {
		console.log('refresh');
		//await this.authService.createRefreshToken(query);
	}

}
