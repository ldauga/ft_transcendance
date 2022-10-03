import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";
import { GetUserDto } from "../dtos/getUser.dto";
import { UserService } from "../user.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy,'jwt') {
    constructor(
        private readonly userService: UserService,
    ){
        super({
            ignoreExpiration: false,
            secretOrKey: 'super-cat',
            passthrough: true,
            jwtFromRequest: ExtractJwt.fromExtractors([(request:Request) => {
                let data = request?.cookies["auth-cookie"];
                console.log('jwt cookies', data);
                if (!data) {
					return null;
                }
				return data.accessToken;
            }])
        });
    }

    async validate(payload:any) {
        const user = await this.userService.getUserById(payload.sub);

        if (!user)
            return null;
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
}
