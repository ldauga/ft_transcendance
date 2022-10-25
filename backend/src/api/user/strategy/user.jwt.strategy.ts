import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";
import axios from 'axios';
import { GetUserDto } from "../dtos/getUser.dto";
import { UserService } from "../user.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(
        private readonly userService: UserService,
    ) {
        super({
            ignoreExpiration: false,
            secretOrKey: process.env.SECRET,
            passthrough: true,
            jwtFromRequest: ExtractJwt.fromExtractors([(request: Request) => {
                let data = request?.cookies["auth-cookie"];
                if (!data) {
                    return null;
                }
                return data.accessToken;
            }])
        });
    }

    async validate(payload: any) {
        const user = await this.userService.getUserById(payload.sub);
        if (!user)
            throw new UnauthorizedException('User not found.')
        //console.log(user)
        let now = Date.now().toString().substring(0, 10);
        //console.log(now)
        if (payload.exp < now) {
            console.log('oui')
        }
        //throw new UnauthorizedException('Expired refresh token');

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
        //console.log(retUser)
        return retUser;
    }
}
