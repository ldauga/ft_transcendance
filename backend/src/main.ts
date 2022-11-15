import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import * as fs from 'fs'

async function bootstrap() {
	const httpsOptions = {
		key: fs.readFileSync('./src/common/certs/key.pem', 'utf8'),
		cert: fs.readFileSync('./src/common/certs/cert.pem', 'utf8'),
	};
	const app = await NestFactory.create(AppModule, { httpsOptions });
	const config: ConfigService = app.get(ConfigService);
	const port: number = config.get<number>('PORT');

	app.enableCors({
		origin: true,
		methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
		credentials: true
	});
	app.use(cookieParser());
	app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

	await app.listen(port, () => {
	});
}

bootstrap();
