import { Body, Controller, Get, Inject, Param, ParseIntPipe, Post, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { RoomsDto } from "./dtos/rooms.dto";
import { RoomsEntity } from "./rooms.entity";
import { RoomsService } from "./rooms.service";

@Controller('rooms')
export class RoomsController {
  @Inject(RoomsService)
  private readonly service: RoomsService;

  @Get()
  @UseGuards(AuthGuard('jwt'))
  public getAllRooms(): Promise<{ id: number, name: string, publicOrPrivate: boolean }[]> {
    return this.service.getAllRooms();
  }

  @Get('/check/:name')
  @UseGuards(AuthGuard('jwt'))
  public async checkRoom(@Param('name') name: string): Promise<boolean> {
    if (name.length > 0 && name.length <= 15) {
      for (let i = 0; i < name.length; i++) {
        var char1 = name.charAt(i);
        var cc = char1.charCodeAt(0);

        if (!((cc > 96 && cc < 123) || (cc > 40 && cc < 91) || (cc > 47 && cc < 58)))
          return null;
      }
      const returnCheck = await this.service.checkRoom(name);
      return returnCheck;
    }
    return null;
  }

  @Get('/:user_id/:user_login/:room_id/:room_name/:password/')
  @UseGuards(AuthGuard('jwt'))
  public async checkIfCanJoin(@Param('user_id', ParseIntPipe) user_id: number, @Param('user_login') user_login: string, @Param('room_id', ParseIntPipe) room_id: number, @Param('room_name') room_name: string, @Param('password') password: string): Promise<String> {
    if (user_id && user_login.length <= 8 && user_login.length > 0 && room_id) {
      for (let i = 0; i < user_login.length; i++) {
        var char1 = user_login.charAt(i);
        var cc = char1.charCodeAt(0);

        if (!((cc > 96 && cc < 123) || cc == 45))
          return null;
      }
      if (room_name.length > 0 && room_name.length <= 15) {
        for (let i = 0; i < room_name.length; i++) {
          var char1 = room_name.charAt(i);
          var cc = char1.charCodeAt(0);
  
          if (!((cc > 96 && cc < 123) || (cc > 40 && cc < 91) || (cc > 47 && cc < 58)))
            return null;
        }
        if (password.length > 0 && password.length <= 10) {
          for (let i = 0; i < password.length; i++) {
            var char1 = password.charAt(i);
            var cc = char1.charCodeAt(0);
    
            if (!((cc > 96 && cc < 123) || (cc > 40 && cc < 91) || (cc > 47 && cc < 58)))
              return null;
          }
          const returnCheck = await this.service.checkIfCanJoin(user_id, user_login, room_id, room_name, password);
          return returnCheck;
        }
      }
    }
    return null;
  }

  @Get('/checkIfOwner/:id/:name')
  @UseGuards(AuthGuard('jwt'))
  public async checkIfOwner(@Param('id', ParseIntPipe) id: number, @Param('name') name: string): Promise<boolean> {
    if (id && name.length > 0 && name.length <= 15) {
      for (let i = 0; i < name.length; i++) {
        var char1 = name.charAt(i);
        var cc = char1.charCodeAt(0);

        if (!((cc > 96 && cc < 123) || (cc > 40 && cc < 91) || (cc > 47 && cc < 58)))
          return null;
      }
      const returnCheck = await this.service.checkIfOwner(id, name);
      return returnCheck;
    }
    return null;
  }
}
