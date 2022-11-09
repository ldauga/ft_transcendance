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
    const returnCheck = await this.MuteListService.checkRoomMute(id, login, roomName);
    console.log('checkRoomMuteReturn Check = ', returnCheck);
    return returnCheck;
  }
}
