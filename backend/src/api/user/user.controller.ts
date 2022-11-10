import { Body, Controller, Get, Inject, Param, ParseIntPipe, Post, UseGuards, Req, UseInterceptors, UploadedFile, Res, UnauthorizedException } from '@nestjs/common';
import { Request } from "express";
import { AuthGuard } from '@nestjs/passport';
import { UserEntity } from './user.entity';
import { UserService } from './user.service';
import { GetUserDto } from './dtos/getUser.dto';
import { Express } from 'express'
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path = require('path');
import { Observable, of } from 'rxjs';
import { join } from 'path';

export const storage = {
  storage: diskStorage({
      destination: './uploads/profileImages',
      filename: (req, file, cb) => {
          const filename: string = uuidv4();
          const extension: string = path.parse(file.originalname).ext;

          cb(null, `${filename}${extension}`)
      }
  })
}

@Controller('user')
export class UserController {
  @Inject(UserService)
  private readonly service: UserService;

  @Get()
  @UseGuards(AuthGuard('jwt'))
  public getAllUsers(): Promise<UserEntity[]> {
    return this.service.getAllUsers();
  }

  @Get('/id/:id')
  @UseGuards(AuthGuard('jwt'))
  public getUser(@Param('id', ParseIntPipe) id: number): Promise<UserEntity> {
	  return this.service.getUserById(id);
  }

  @Get('/login/:login')
  @UseGuards(AuthGuard('jwt'))
  public getUserByLogin(@Param('login') login: string): Promise<UserEntity> {
    console.log('Login')
    return this.service.getUserByLogin(login);
  }

  @Get('/nickname/:nickname')
  @UseGuards(AuthGuard('jwt'))
  public getUserByNickname(@Param('nickname') nickname: string): Promise<UserEntity> {
    console.log('Nickname')
	  return this.service.getUserByNickname(nickname);
  }

  @Get('/userExist')
  @UseGuards(AuthGuard('refresh'))
  public userExist(@Req() req: Request): Promise<GetUserDto> {
    const refreshToken = req.cookies['auth-cookie']?.refreshToken;
    if (refreshToken == undefined)
      throw new UnauthorizedException('Missing refreshToken.')
    return this.service.getUserByRefreshToken(refreshToken);
  }

  @Get('profilePic/:fileId')
  @UseGuards(AuthGuard('jwt'))
  getProfilePic(@Param('fileId') fileId: string, @Res() res): Observable<Object> {
    return of(res.sendFile(join(process.cwd(), 'uploads/profileImages/' + fileId.split(':')[1])));
  }

  @Post('upload')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('photo', storage))
  public uploadFile(@Req() req: Request, @UploadedFile() image: Express.Multer.File) {
    return this.service.updateProfilePic(req.cookies['auth-cookie'].refreshToken, image.filename)
  }

}
