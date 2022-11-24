import { Body, Controller, Get, Inject, Param, ParseIntPipe, Post, UseGuards } from "@nestjs/common";
import { BlackListDto } from "./dtos/blackList.dto";
import { BlackListEntity } from "./blackList.entity";
import { BlackListService } from "./blackList.service";
import { AuthGuard } from "@nestjs/passport";

@Controller('blackList')
export class BlackListController {
  @Inject(BlackListService)
  private readonly BlackListService: BlackListService;

  @Get()
  @UseGuards(AuthGuard('jwt'))
  public getAllBan(): Promise<{ login_banned: string, userOrRoom: boolean, id_sender: number, login_sender: string, room_id: number, date: number, timer: number }[]> {
    return this.BlackListService.getAllBanTimer();
  }

  @Get('/getAllRoomBan/:roomId/:roomName')
  public getAllRoomBan(@Param('roomId', ParseIntPipe) roomId: number, @Param('roomName') roomName: string): Promise<{ id_banned: number, login_banned: string }[]> {
    if (roomId && roomName.length > 0 && roomName.length <= 15) {
      for (let i = 0; i < roomName.length; i++) {
        var char1 = roomName.charAt(i);
        var cc = char1.charCodeAt(0);

        if (!((cc > 96 && cc < 123) || (cc > 40 && cc < 91) || (cc > 47 && cc < 58)))
          return null;
      }
      return this.BlackListService.getAllRoomBan(roomId, roomName);
    }
    return null;
  }

  @Get('/getAllUserBan/:id/:login')
  public getAllUserBan(@Param('id', ParseIntPipe) id: number, @Param('login') login: string): Promise<{ id_banned: number, login_banned: string }[]> {
    if (id && login.length <= 8 && login.length > 0) {
      for (let i = 0; i < login.length; i++) {
        var char1 = login.charAt(i);
        var cc = char1.charCodeAt(0);

        if (!((cc > 96 && cc < 123) || cc == 45))
          return null;
      }
      return this.BlackListService.getAllUserBan(id, login);
    }
    return null;
  }

  @Get('/checkIfRelationIsBlocked/:login1/:login2')
  @UseGuards(AuthGuard('jwt'))
  public async checkIfRelationIsBlocked(@Param('login1') login1: string, @Param('login2') login2: string): Promise<boolean> {
    if (login1.length <= 8 && login2.length <= 8 && login1.length > 0 && login2.length > 0) {
      for (let i = 0; i < login1.length && i < login2.length; i++) {
        var char1 = login1.charAt(i);
        var cc = char1.charCodeAt(0);

        if (!((cc > 96 && cc < 123) || cc == 45))
          return null;
        var char2 = login2.charAt(i);
        var cc2 = char2.charCodeAt(0);

        if (!((cc2 > 96 && cc2 < 123) || cc2 == 45))
          return null;
      }
      const returnCheck = await this.BlackListService.checkUserBan(login1, login2);
      return returnCheck;
    }
    return null;
  }

  @Get('/checkUserBan/:login/:loginReceiver')
  @UseGuards(AuthGuard('jwt'))
  public async checkUserBan(@Param('login') login: string, @Param('loginReceiver') loginReceiver: string): Promise<boolean> {
    if (login.length <= 8 && loginReceiver.length <= 8 && login.length > 0 && loginReceiver.length > 0) {
      for (let i = 0; i < login.length && i < loginReceiver.length; i++) {
        var char1 = login.charAt(i);
        var cc = char1.charCodeAt(0);

        if (!((cc > 96 && cc < 123) || cc == 45))
          return null;
        var char2 = loginReceiver.charAt(i);
        var cc2 = char2.charCodeAt(0);

        if (!((cc2 > 96 && cc2 < 123) || cc2 == 45))
          return null;
      }
      const returnCheck = await this.BlackListService.checkUserBan(login, loginReceiver);
      return returnCheck;
    }
    return null;
  }

  @Get('/checkRoomBan/:id/:login/:roomName')
  @UseGuards(AuthGuard('jwt'))
  public async checkRoomBan(@Param('id', ParseIntPipe) id: number, @Param('login') login: string, @Param('roomName') roomName: string): Promise<boolean> {
    if (id && login.length <= 8 && login.length > 0) {
      for (let i = 0; i < login.length; i++) {
        var char1 = login.charAt(i);
        var cc = char1.charCodeAt(0);

        if (!((cc > 96 && cc < 123) || cc == 45))
          return null;
      }
      if (roomName.length > 0 && roomName.length <= 15) {
        for (let i = 0; i < roomName.length; i++) {
          var char1 = roomName.charAt(i);
          var cc = char1.charCodeAt(0);
  
          if (!((cc > 96 && cc < 123) || (cc > 40 && cc < 91) || (cc > 47 && cc < 58)))
            return null;
        }
        const returnCheck = await this.BlackListService.checkRoomBan(id, login, roomName);
        return returnCheck;
      }
    }
    return null;
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  public async createBan(@Body() body: BlackListDto): Promise<BlackListEntity> {
    if (body) {
      const newBan = await this.BlackListService.createBan(body);
      return newBan;
    }
  }

}
