import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiModule } from './api/api.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { getEnvPath } from './common/helper/env.helper';
import { CronService, EventsGateway } from './api/events/events.gateway';
import { TypeOrmConfigService } from './shared/typeorm/typeorm.service';
import { FriendListModule } from './api/friendsList/friendList.module';
import { InvitationRequestModule } from './api/invitationRequest/invitationRequest.module';
import { RoomsService } from './api/rooms/rooms.service';
import { RoomsModule } from './api/rooms/rooms.module';
import { MessagesModule } from './api/messages/messages.module';
import { PartcipantsModule } from './api/participants/participants.module';
import { MatchesHistoryModule } from './api/matchesHistory/matchesHistory.module';
import { BlackListModule } from './api/blackList/blackList.module';
//import { AppLoggerMiddleware } from './app.middleware';

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
		ScheduleModule.forRoot(),
	],
	controllers: [AppController],
	providers: [AppService, EventsGateway, CronService],
})
export class AppModule {
}
