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
import { extname } from 'path';

/*export const storage = {
  storage: diskStorage({
      destination: './profilePics',
      filename: (req, file, cb) => {
        const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('')
        return cb(null, `${randomName}${extname(file.originalname)}`)
      }
  })
}*/


@Controller('user')
export class UserController {
  @Inject(UserService)
  private readonly service: UserService;

  @Get('fav-movies')
  @UseGuards(AuthGuard('jwt'))
  async movies(@Req() req){
    console.log(req.cookies['auth-cookie'])
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
  public userExist(@Param('refreshToken') refreshToken: string): Promise<GetUserDto> {
    return this.service.getUserByRefreshToken(refreshToken);
  }

/*@Get('profilePic/:fileId')
  getProfilePic(@Param('fileId') fileId, @Res() res) {
    console.log(fileId)
    return res.sendFile(fileId, { root: './profilePics'});
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', storage))
  public uploadFile(@Body() body, @UploadedFile() file: Express.Multer.File) {
    console.log(body.id)
    console.log(file.filename);
    return this.service.updateProfilePic(body, file.filename)
  }*/

  @Post('updateNickname')
  public updateNickname(@Body() body: UpdateNicknameDto): Promise<GetUserDto> {
    return this.service.updateNickname(body);
  }

}
