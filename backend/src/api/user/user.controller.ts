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
      destination: './uploads/profileImages',
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
    if (id)
      return this.service.getUserById(id);
    else
      return null;
  }

  @Get('/login/:login')
  @UseGuards(AuthGuard('jwt'))
  public getUserByLogin(@Param('login') login: string): Promise<UserEntity> {
    if (login.length <= 8 && login.length > 0) {
      for (let i = 0; i < login.length; i++) {
        var char1 = login.charAt(i);
        var cc = char1.charCodeAt(0);

        if (!((cc > 96 && cc < 123) || cc == 45)) {
          return null;
        }
      }
      return this.service.getUserByLogin(login);
    }
    return null;
  }

  @Get('/nickname/:nickname')
  @UseGuards(AuthGuard('jwt'))
  public getUserByNickname(@Param('nickname') nickname: string): Promise<UserEntity> {
    if (nickname.length <= 8 && nickname.length > 0) {
      for (let i = 0; i < nickname.length; i++) {
        var char1 = nickname.charAt(i);
        var cc = char1.charCodeAt(0);

        if (!((cc > 96 && cc < 123) || cc == 45)) {
          return null;
        }
      }
      return this.service.getUserByNickname(nickname);
    }
    return null;
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
  async getProfilePic(@Param('fileId') fileId: string, @Req() req: Request, @Res() res): Promise<Object> {
	const refreshToken = req.cookies['auth-cookie']?.refreshToken;
    const fileName = fileId.split(':')[1];
    var options = {
      root: path.join(process.cwd() + '/uploads/profileImages/')
    };

	const user = await this.service.getUserByRefreshToken(refreshToken);
	if (user.profile_pic.substring(8, 11) == "cdn") {
		return res.sendFile(fileName, options, function (err) {
			if (err) {
				throw new BadRequestException('Unable to find user\'s avatar');
			}
		});
	}
	return res.sendFile(fileName, options);
  }

  @Post('upload')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('photo', multerOptions))
  public async uploadFile(@Req() req: Request, @UploadedFile() image: Express.Multer.File) {
	if (image.filename) {
		let buffer = readFileSync(process.cwd() + '/uploads/profileImages/'+ image.filename)
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
	} else
		throw new BadRequestException('Unable to update your avatar, file too big.');
  }

  @Post('firstConnection')
  @UseGuards(AuthGuard('jwt'))
  public firstConnection(@Req() req: Request) {
    return this.service.firstConnection(req.cookies['auth-cookie'].refreshToken)
  }
}
