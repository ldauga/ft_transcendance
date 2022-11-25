import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../user/user.module';
import { HttpModule } from '@nestjs/axios';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { LocalStrategy } from './strategy/local.strategy';
import { UserEntity } from '../user/user.entity';
import { ConfigService } from '@nestjs/config';

@Module({
	imports: [
		TypeOrmModule.forFeature([UserEntity]),
		PassportModule.register({ defaultStrategy: 'local' }),
		JwtModule.registerAsync({
			useFactory: async (configService: ConfigService) => {
				return {
					secret: configService.get<string>('SECRET'),
					signOptions: {
						expiresIn: '1h',
					},
				};
			},
			inject: [ConfigService],
		}),
		HttpModule,
		UserModule,
	],
	controllers: [AuthController],
	providers: [AuthService, LocalStrategy],
	exports: [AuthService]
})

export class AuthModule { }
