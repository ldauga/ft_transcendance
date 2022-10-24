import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { MatchesHistoryModule } from './matchesHistory/matchesHistory.module';
import { MessagesModule } from './messages/messages.module';
import { FriendListModule } from './friendsList/friendList.module';
import { InvitationRequestModule } from './invitationRequest/invitationRequest.module';
import { RoomsModule } from './rooms/rooms.module';
import { PartcipantsModule } from './participants/participants.module';
import { BlackListModule } from './blackList/blackList.module';
import { MuteListModule } from './muteList/muteList.module';

@Module({
  imports: [UserModule, AuthModule, MatchesHistoryModule, MessagesModule, 
    FriendListModule, InvitationRequestModule, RoomsModule, 
    PartcipantsModule, BlackListModule, MuteListModule],
})
export class ApiModule { }
