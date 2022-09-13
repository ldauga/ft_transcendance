import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { TypeOrmModule } from "@nestjs/typeorm";
import { JwtStrategy } from "../user/strategy/user.jwt.strategy";
import { MessagesController } from "./messages.controller";
import { MessagesEntity } from "./messages.entity";
import { MessagesService } from "./messages.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([MessagesEntity]),
        PassportModule.register({ defaultStrategy: 'jwt' }),
    ],
    controllers: [MessagesController],
    providers: [JwtStrategy, MessagesService],
    exports: [MessagesService]
})
export class MessagesModule { }