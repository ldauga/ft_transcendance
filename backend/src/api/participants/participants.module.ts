import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { TypeOrmModule } from "@nestjs/typeorm";
import { JwtStrategy } from "../user/strategy/user.jwt.strategy";
import { UserModule } from "../user/user.module";
import { ParticipantsController } from "./participants.controller";
import { ParticipantsEntity } from "./participants.entity";
import { ParticipantsService } from "./participants.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([ParticipantsEntity]),
        PassportModule.register({ defaultStrategy: 'jwt' }),
        UserModule
    ],
    controllers: [ParticipantsController],
    providers: [JwtStrategy, ParticipantsService],
    exports: [ParticipantsService]
})
export class PartcipantsModule { }