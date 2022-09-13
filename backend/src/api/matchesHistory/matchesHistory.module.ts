import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { TypeOrmModule } from "@nestjs/typeorm";
import { JwtStrategy } from "../user/strategy/user.jwt.strategy";
import { UserModule } from "../user/user.module";
import { MatchesHistoryController } from "./matchesHistory.controller";
import { MatchesHistoryEntity } from "./matchesHistory.entity";
import { MatchesHistoryService } from "./matchesHistory.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([MatchesHistoryEntity]),
        PassportModule.register({ defaultStrategy: 'jwt' }),
        UserModule,
    ],
    controllers: [MatchesHistoryController],
    providers: [JwtStrategy, MatchesHistoryService],
    exports: [MatchesHistoryService]
})
export class MatchesHistoryModule { }