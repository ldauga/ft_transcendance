import { Body, Controller, Get, Inject, Param, ParseIntPipe, Post } from "@nestjs/common";
import { MuteListDto } from "./dtos/muteList.dto";
import { MuteListEntity } from "./muteList.entity";
import { MuteListService } from "./muteList.service";

@Controller('muteList')
export class MuteListController {
  @Inject(MuteListService)
  private readonly MuteListService: MuteListService;

  @Get()
  public getAllMute(): Promise<{ login_muted: string, userOrRoom: boolean, id_sender: number, login_sender: string, room_id: number, alwaysOrNot: boolean, date: number, timer: number }[]> {
    return this.MuteListService.getAllMuteTimer();
  }

  @Get('/checkRoomMute/:id/:login/:roomName')
  public async checkRoomMute(@Param('id', ParseIntPipe) id: number, @Param('login') login: string, @Param('roomName') roomName: string): Promise<boolean> {
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
        const returnCheck = await this.MuteListService.checkRoomMute(id, login, roomName);
        return returnCheck;
      }
    }
    return null;
  }
}
