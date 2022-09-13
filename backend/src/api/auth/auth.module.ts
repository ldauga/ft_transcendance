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

@Module({
  imports: [
	  TypeOrmModule.forFeature([UserEntity]),
	  PassportModule.register({ defaultStrategy: 'local' }),
	  JwtModule.register({
		  secret: 'super-cat',
		  signOptions: {
			  expiresIn: '10min',
		  },
	  }),
	  HttpModule,
	  UserModule,
	],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy],
  exports: [AuthService]
})

export class AuthModule {}
