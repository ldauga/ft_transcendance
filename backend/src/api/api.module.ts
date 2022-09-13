import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { MatchesHistoryModule } from './matchesHistory/matchesHistory.module';
import { MessagesModule } from './messages/messages.module';
import { FriendListModule } from './friendsList/friendList.module';
import { InvitationRequestModule } from './invitationRequest/invitationRequest.module';

@Module({
  imports: [UserModule, AuthModule, MatchesHistoryModule, MessagesModule, FriendListModule, InvitationRequestModule],
})
export class ApiModule { }
