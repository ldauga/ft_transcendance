import { Body, Controller, Get, Inject, Param, ParseIntPipe, Post, UseGuards, Req, BadRequestException } from '@nestjs/common';
import { Request } from "express";
import { AuthGuard } from '@nestjs/passport';
import { CreateUserDto } from './dtos/createUser.dto';
import { UserEntity } from './user.entity';
import { UserService } from './user.service';
import { GetUserDto } from './dtos/getUser.dto';

@Controller('user')
export class UserController {
  @Inject(UserService)
  private readonly service: UserService;

  @Get('fav-movies')
  @UseGuards(AuthGuard('jwt'))
  async movies(@Req() req){
  	return ["Avatar", "Avengers"];
  }

  @Get()
  public getAllUsers(): Promise<UserEntity[]> {
    return this.service.getAllUsers();
  }

  @Get('/id/:id')
  public getUser(@Param('id', ParseIntPipe) id: number): Promise<UserEntity> {
	return this.service.getUserById(id);
  }

  @Get('/login/:login')
  public getUserByLogin(@Param('login') login: string): Promise<UserEntity> {
	return this.service.getUserByLogin(login);
  }

  @Get('/userExist/:refreshToken')
  // @UseGuards(AuthGuard('local'))
  public userExist(@Param('refreshToken') refreshToken: string): Promise<GetUserDto> {
    //if (!req.cookies['auth-cookie'])
    //  throw new BadRequestException();
    return this.service.getUserByRefreshToken(refreshToken);
  }

  @Post()
  public createUser(@Body() body: CreateUserDto): Promise<UserEntity> {
	const user = this.service.createUser(body);
	if (user)
		return user;
	/*else {
		throw new BaseExceptionFilter;
	}*/
  }
}
