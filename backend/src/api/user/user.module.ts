import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { UserEntity } from './user.entity';
import { UserService } from './user.service';
import { JwtStrategy } from './strategy/user.jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { RefreshStrategy } from './strategy/refresh.strategy';
import { ConfigService } from '@nestjs/config';


@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]),
  PassportModule.register({ defaultStrategy: 'jwt' }),
  JwtModule.registerAsync({
    useFactory: async (configService: ConfigService) => {
      return {
        secret: configService.get<string>('SECRET'),
        signOptions: {
          expiresIn: '7d',
        },
      };
    },
    inject: [ConfigService],
  }),
  ],
  controllers: [UserController],
  providers: [UserService, JwtStrategy, RefreshStrategy],
  exports: [UserService]
})
export class UserModule {}
