import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { TypeOrmModule } from "@nestjs/typeorm";
import { JwtStrategy } from "../user/strategy/user.jwt.strategy";
import { UserModule } from "../user/user.module";
import { MuteListController } from "./muteList.controller";
import { MuteListEntity } from "./muteList.entity";
import { MuteListService } from "./muteList.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([MuteListEntity]),
        PassportModule.register({ defaultStrategy: 'jwt' }),
        UserModule,
    ],
    controllers: [MuteListController],
    providers: [JwtStrategy, MuteListService],
    exports: [MuteListService]
})
export class MuteListModule { }