import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
	const app = await NestFactory.create(AppModule, { cors: {credentials: true, origin: 'http://localhost:3000'} });
	const config: ConfigService = app.get(ConfigService);
	const port: number = config.get<number>('PORT');

	app.use(cookieParser());
	app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

	await app.listen(port, () => {
		console.log('[WEB]', config.get<string>('BASE_URL'));
	});
}

bootstrap();
