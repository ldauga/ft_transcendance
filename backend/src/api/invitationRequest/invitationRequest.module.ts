import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { TypeOrmModule } from "@nestjs/typeorm";
import { JwtStrategy } from "../user/strategy/user.jwt.strategy";
import { InvitationRequestController } from "./invitationRequest.controller";
import { InvitationRequestEntity } from "./invitationRequest.entity";
import { invitationRequestService } from "./invitationRequest.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([InvitationRequestEntity]),
        PassportModule.register({ defaultStrategy: 'jwt' }),
    ],
    controllers: [InvitationRequestController],
    providers: [JwtStrategy, invitationRequestService],
    exports: [invitationRequestService]
})
export class InvitationRequestModule { }