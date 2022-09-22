import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UserService } from "src/api/user/user.service";

@Injectable()
export class TwoFAStrategy extends PassportStrategy(Strategy,'2fa') {
    constructor(
        private userService: UserService
    ){
        super({
            ignoreExpiration: false,
            secretOrKey: 'super-cat',
            jwtFromRequest: ExtractJwt.fromExtractors([(request:Request) => {
                let data = request?.cookies["auth-cookie"];
                if (!data) {

					return null;
                }
				return data.refreshToken;
            }])
        });
    }

    async validate(payload:any){
        const user = await this.userService.getUserByToken(payload.token)
        if (!user)
            throw new UnauthorizedException('Invalid refresh token');
        return payload;
    }
}

