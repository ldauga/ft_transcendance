import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { TypeOrmModule } from "@nestjs/typeorm";
import { JwtStrategy } from "../user/strategy/user.jwt.strategy";
import { UserModule } from "../user/user.module";
import { MessagesController } from "./messages.controller";
import { MessagesEntity } from "./messages.entity";
import { MessagesService } from "./messages.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([MessagesEntity]),
        PassportModule.register({ defaultStrategy: 'jwt' }),
        UserModule
    ],
    controllers: [MessagesController],
    providers: [JwtStrategy, MessagesService],
    exports: [MessagesService]
})
export class MessagesModule { }