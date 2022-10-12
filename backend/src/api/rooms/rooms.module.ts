import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { TypeOrmModule } from "@nestjs/typeorm";
import { JwtStrategy } from "../user/strategy/user.jwt.strategy";
import { UserModule } from "../user/user.module";
import { RoomsController } from "./rooms.controller";
import { RoomsEntity } from "./rooms.entity";
import { RoomsService } from "./rooms.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([RoomsEntity]),
        PassportModule.register({ defaultStrategy: 'jwt' }),
        UserModule
    ],
    controllers: [RoomsController],
    providers: [JwtStrategy, RoomsService],
    exports: [RoomsService]
})
export class RoomsModule { }