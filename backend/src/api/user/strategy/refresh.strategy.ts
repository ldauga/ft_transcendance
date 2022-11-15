import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UserService } from "src/api/user/user.service";
import { GetUserDto } from "../dtos/getUser.dto";

@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, 'refresh') {
    constructor(
        private userService: UserService
    ) {
        super({
            ignoreExpiration: true,
            secretOrKey: process.env.SECRET,
            jwtFromRequest: ExtractJwt.fromExtractors([(request: Request) => {
                let data = request?.cookies["auth-cookie"];
                if (!data) {
                    return null;
                }
                return data.refreshToken;
            }])
        });
    }

    async validate(payload: any) {
        const user = await this.userService.getUserByToken(payload.token)

        if (!user)
            throw new UnauthorizedException('Invalid refresh token');

        let now = Date.now().toString().substring(0, 10);

        if (user.refreshTokenExp <= now)
            throw new UnauthorizedException('Expired refresh token');

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
}
