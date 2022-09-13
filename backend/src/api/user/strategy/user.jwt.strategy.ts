import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtSecretRequestType } from "@nestjs/jwt";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";

//REFRESH TOKENS VERIF
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy,'jwt') {
    constructor(){
        super({
            ignoreExpiration: false,
            secretOrKey: 'super-cat',
            jwtFromRequest: ExtractJwt.fromExtractors([(request:Request) => {
                let data = request?.cookies["auth-cookie"];
                if (!data) {

					return null;
                }
				return data.accessToken;
            }])
        });
    }

    async validate(payload:any){
        return payload;
    }
}
