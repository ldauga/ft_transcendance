import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "../auth/auth.module";
import { BlackListEntity } from "../blackList/blackList.entity";
import { BlackListModule } from "../blackList/blackList.module";
import { BlackListService } from "../blackList/blackList.service";
import { FriendListEntity } from "../friendsList/friendList.entity";
import { FriendListModule } from "../friendsList/friendList.module";
import { FriendListService } from "../friendsList/friendList.service";
import { InvitationRequestEntity } from "../invitationRequest/invitationRequest.entity";
import { InvitationRequestService } from "../invitationRequest/invitationRequest.service";
import { MatchesHistoryEntity } from "../matchesHistory/matchesHistory.entity";
import { MatchesHistoryService } from "../matchesHistory/matchesHistory.service";
import { MessagesEntity } from "../messages/messages.entity";
import { MessagesService } from "../messages/messages.service";
import { MuteListEntity } from "../muteList/muteList.entity";
import { MuteListService } from "../muteList/muteList.service";
import { ParticipantsEntity } from "../participants/participants.entity";
import { ParticipantsService } from "../participants/participants.service";
import { RoomsEntity } from "../rooms/rooms.entity";
import { RoomsService } from "../rooms/rooms.service";
import { UserModule } from "../user/user.module";
import { EventsGateway } from "./events.gateway";
import { PongGateway } from "./pong.gateway";

@Module({
    imports: [
        TypeOrmModule.forFeature([FriendListEntity, InvitationRequestEntity, MatchesHistoryEntity,
            MessagesEntity, ParticipantsEntity, RoomsEntity, BlackListEntity, MuteListEntity]),
        AuthModule, UserModule
    ],
    providers: [EventsGateway, PongGateway, FriendListService, InvitationRequestService,
        MatchesHistoryService, MessagesService, ParticipantsService, RoomsService, BlackListService, MuteListService],
    exports: [EventsModule]
})
export class EventsModule { }