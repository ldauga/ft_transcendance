import { Controller, Get, Inject, Param, ParseIntPipe, Post, UseGuards, Req, UseInterceptors, UploadedFile, Res, UnauthorizedException, BadRequestException, Logger, ConsoleLogger } from '@nestjs/common';
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
import { Observable } from 'rxjs';
import { extname } from 'path';
import { existsSync, mkdirSync, readFileSync, unlink } from 'fs';

export const multerOptions = {
  limits: {
      fileSize: 1048576,
  },
  fileFilter: (req: any, file: any, cb: any) => {
      if (file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
          cb(null, true);
      } else {
          cb(new BadRequestException(`Unsupported file type ${extname(file.originalname)}`));
      }
  },
  storage: diskStorage({
      destination: (req: any, file: any, cb: any) => {
          const uploadPath = './uploads/profileImages';
          if (!existsSync(uploadPath)) {
              mkdirSync(uploadPath);
          }
          cb(null, uploadPath);
      },
      filename: (req: any, file: any, cb: any) => {
          cb(null, `${uuidv4()}${extname(file.originalname)}`);
      },
  }),
};

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
    return this.service.getUserByLogin(login);
  }

  @Get('/nickname/:nickname')
  @UseGuards(AuthGuard('jwt'))
  public getUserByNickname(@Param('nickname') nickname: string): Promise<UserEntity> {
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
    const fileName = fileId.split(':')[1];
    var options = {
      root: path.join(process.cwd() + '/uploads/profileImages/')
    };

    return res.sendFile(fileName, options, function (err) {
      if (err) {
        throw new BadRequestException('Unable to find user\'s avatar');
      }
    });
  }

  @Post('upload')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('photo', multerOptions))
  public async uploadFile(@Req() req: Request, @UploadedFile() image: Express.Multer.File) {
	const buffer = readFileSync(process.cwd() + '/uploads/profileImages/'+ image.filename)
	const res = await this.service.checkMagicNumber(image.mimetype, buffer);
	if (!res) {
		unlink(process.cwd() + '/uploads/profileImages/'+ image.filename, (err) => {
			if(err)
				return err;
		});
		throw new BadRequestException('Unable to update your avatar.')
	}
	const ret = this.service.updateProfilePic(req.cookies['auth-cookie'].refreshToken, image.filename)
	return ret;
  }

  @Post('firstConnection')
  @UseGuards(AuthGuard('jwt'))
  public firstConnection(@Req() req: Request) {
    return this.service.firstConnection(req.cookies['auth-cookie'].refreshToken)
  }
}
