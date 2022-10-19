import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { TypeOrmModule } from "@nestjs/typeorm";
import { JwtStrategy } from "../user/strategy/user.jwt.strategy";
import { UserModule } from "../user/user.module";
import { InvitationRequestController } from "./invitationRequest.controller";
import { InvitationRequestEntity } from "./invitationRequest.entity";
import { InvitationRequestService } from "./invitationRequest.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([InvitationRequestEntity]),
        PassportModule.register({ defaultStrategy: 'jwt' }),
        UserModule,
    ],
    controllers: [InvitationRequestController],
    providers: [JwtStrategy, InvitationRequestService],
    exports: [InvitationRequestService]
})
export class InvitationRequestModule { }