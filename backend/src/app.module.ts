import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiModule } from './api/api.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { getEnvPath } from './common/helper/env.helper';
import { TypeOrmConfigService } from './shared/typeorm/typeorm.service';
import { FriendListModule } from './api/friendsList/friendList.module';
import { InvitationRequestModule } from './api/invitationRequest/invitationRequest.module';
import { RoomsModule } from './api/rooms/rooms.module';
import { MessagesModule } from './api/messages/messages.module';
import { PartcipantsModule } from './api/participants/participants.module';
import { MatchesHistoryModule } from './api/matchesHistory/matchesHistory.module';
import { BlackListModule } from './api/blackList/blackList.module';
import { MuteListModule } from './api/muteList/muteList.module';
import { EventsModule } from './api/events/events.module';

const envFilePath: string = getEnvPath(`${__dirname}/common/envs`);

@Module({
	imports: [
		ConfigModule.forRoot({ envFilePath, isGlobal: true }),
		TypeOrmModule.forRootAsync({ useClass: TypeOrmConfigService }),
		ApiModule,
		FriendListModule,
		InvitationRequestModule,
		RoomsModule,
		MessagesModule,
		PartcipantsModule,
		MatchesHistoryModule,
		BlackListModule,
		MuteListModule,
		EventsModule,
		ScheduleModule.forRoot(),
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {
}
