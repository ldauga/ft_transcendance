import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { TypeOrmModule } from "@nestjs/typeorm";
import { JwtStrategy } from "../user/strategy/user.jwt.strategy";
import { UserModule } from "../user/user.module";
import { FriendListController } from "./friendList.controller";
import { FriendListEntity } from "./friendList.entity";
import { FriendListService } from "./friendList.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([FriendListEntity]),
        PassportModule.register({ defaultStrategy: 'jwt' }),
        UserModule
    ],
    controllers: [FriendListController],
    providers: [JwtStrategy, FriendListService],
    exports: [FriendListService]
})
export class FriendListModule { }