import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiModule } from './api/api.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { getEnvPath } from './common/helper/env.helper';
import { EventsGateway } from './events.gateway';
import { TypeOrmConfigService } from './shared/typeorm/typeorm.service';
//import { AppLoggerMiddleware } from './app.middleware';

const envFilePath: string = getEnvPath(`${__dirname}/common/envs`);

@Module({
	imports: [
		ConfigModule.forRoot({ envFilePath, isGlobal: true }),
		TypeOrmModule.forRootAsync({ useClass: TypeOrmConfigService }),
		ApiModule,
		ScheduleModule.forRoot(),
	],
	controllers: [AppController],
	providers: [AppService, EventsGateway],
})
export class AppModule {
}
