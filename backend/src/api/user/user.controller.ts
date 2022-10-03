import { Body, Controller, Get, Inject, Param, ParseIntPipe, Post, UseGuards, Req, BadRequestException, UseInterceptors, UploadedFile, Res } from '@nestjs/common';
import { Request } from "express";
import { AuthGuard } from '@nestjs/passport';
import { CreateUserDto } from './dtos/createUser.dto';
import { UserEntity } from './user.entity';
import { UserService } from './user.service';
import { GetUserDto } from './dtos/getUser.dto';
import { Express } from 'express'
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateNicknameDto } from './dtos/updateNickname.dto';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path = require('path');
import { Observable, of } from 'rxjs';
import { join } from 'path';

export const storage = {
  storage: diskStorage({
      destination: './uploads/profileimages',
      filename: (req, file, cb) => {
          const filename: string = path.parse(file.originalname).name.replace(/\s/g, '') + uuidv4();
          const extension: string = path.parse(file.originalname).ext;

          cb(null, `${filename}${extension}`)
      }
  })
}

@Controller('user')
// @UseGuards(AuthGuard('refresh'))
export class UserController {
  @Inject(UserService)
  private readonly service: UserService;

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
  public userExist(@Param('refreshToken') refreshToken: string): Promise<GetUserDto> {
    return this.service.getUserByRefreshToken(refreshToken);
  }

  @Get('profilePic/:fileId')
  getProfilePic(@Param('fileId') fileId: string, @Res() res): Observable<Object> {
    return of(res.sendFile(join(process.cwd(), 'uploads/profileImages/' + fileId.split(':')[1])));
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', storage))
  public uploadFile(@Body() body, @UploadedFile() file: Express.Multer.File) {
    return this.service.updateProfilePic(body, file.filename)
  }

  @Post('updateNickname')
  public updateNickname(@Body() body: UpdateNicknameDto): Promise<GetUserDto> {
    return this.service.updateNickname(body);
  }

}
