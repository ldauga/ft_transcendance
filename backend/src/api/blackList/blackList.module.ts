import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { TypeOrmModule } from "@nestjs/typeorm";
import { JwtStrategy } from "../user/strategy/user.jwt.strategy";
import { UserModule } from "../user/user.module";
import { BlackListController } from "./blackList.controller";
import { BlackListEntity } from "./blackList.entity";
import { BlackListService } from "./blackList.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([BlackListEntity]),
        PassportModule.register({ defaultStrategy: 'jwt' }),
        UserModule,
    ],
    controllers: [BlackListController],
    providers: [JwtStrategy, BlackListService],
    exports: [BlackListService]
})
export class BlackListModule { }