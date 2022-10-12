import { Body, Controller, Get, Inject, Param, ParseIntPipe, Post, UseGuards, Req, BadRequestException, UseInterceptors, UploadedFile, Res, Put, Patch } from '@nestjs/common';
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

  @Get('/userExist')
  public userExist(@Req() req: Request): Promise<GetUserDto> {
    return this.service.getUserByRefreshToken(req.cookies['auth-cookie'].refreshToken);
  }

  @Get('profilePic/:fileId')
  getProfilePic(@Param('fileId') fileId: string, @Res() res): Observable<Object> {
    return of(res.sendFile(join(process.cwd(), 'uploads/profileImages/' + fileId.split(':')[1])));
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('photo', storage))
  public uploadFile(@Req() req: Request, @UploadedFile() image: Express.Multer.File) {
    return this.service.updateProfilePic(req.cookies['auth-cookie'].refreshToken, image.filename)
  }

  @Post('updateNickname')
  public updateNickname(@Req() req: Request, @Body() body): Promise<GetUserDto> {
    return this.service.updateNickname(req.cookies['auth-cookie'].refreshToken, body);
  }

  @Post('updateRank')
  public updateRank(@Req() req: Request, @Body() body): Promise<GetUserDto> {
    return this.service.updateRank(req.cookies['auth-cookie'].refreshToken, body);
  }
}
