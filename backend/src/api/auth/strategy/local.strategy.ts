import { ConsoleLogger, Injectable, Req, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UserService } from "src/api/user/user.service";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy,'local') {
    constructor(
		private userServices: UserService
	){
        super({
            ignoreExpiration: false,
            secretOrKey: 'super-cat',
            jwtFromRequest: ExtractJwt.fromExtractors([(request:Request) => {
                let data = request?.cookies["auth-cookie"];
                console.log(Date.now());
                if (!data) {
					return null;
                }
				return data.accessToken;
            }])
        });
    }

    async validate(payload:any){
		const user = await this.userServices.getUserById(payload.sub);
        if (!user)
            throw new UnauthorizedException('Invalid access token');        
        return payload;
    }
}
