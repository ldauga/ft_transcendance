import { Body, Controller, Get, Inject, Param, ParseIntPipe, Post } from "@nestjs/common";
import { MuteListDto } from "./dtos/muteList.dto";
import { MuteListEntity } from "./muteList.entity";
import { MuteListService } from "./muteList.service";

@Controller('muteList')
export class MuteListController {
  @Inject(MuteListService)
  private readonly MuteListService: MuteListService;

  @Get()
  public getAllBan(): Promise<{ login_muted: string, userOrRoom: boolean, id_sender: number, room_id: number, date: number, timer: number }[]> {
    return this.MuteListService.getAllMuteTimer();
  }

  @Get('/checkUserBan/:login/:loginReceiver')
  public async checkUserBan(@Param('login') login: string, @Param('loginReceiver') loginReceiver: string): Promise<Boolean> {
    const returnCheck = await this.MuteListService.checkUserMute(login, loginReceiver);
    console.log('checkUserBanReturn Check = ', returnCheck);
    return returnCheck;
  }

  @Get('/checkRoomBan/:id/:login/:roomName')
  public async checkRoomBan(@Param('id', ParseIntPipe) id: number, @Param('login') login: string, @Param('roomName') roomName: string): Promise<Boolean> {
    const returnCheck = await this.MuteListService.checkRoomMute(id, login, roomName);
    console.log('checkRoomBanReturn Check = ', returnCheck);
    return returnCheck;
  }

  @Post()
  public async createBan(@Body() body: MuteListDto): Promise<MuteListEntity> {
    const newBan = await this.MuteListService.createMute(body);
    return newBan;
  }

  @Post('/removeUserBan/:id/:login')
  public async removeUserBan(@Param('id', ParseIntPipe) id_sender: number, @Param('login') login_banned: string): Promise<Boolean> {
    // console.log('body', body);
    console.log('removeUserBan Controller');
    const removeReturn = await this.MuteListService.removeUserMute(id_sender, login_banned);
    console.log('removeReturn Controller', removeReturn);
    return true;
  }

  @Post('/removeRoomBan/:id/:login')
  public async removeRoomBan(@Param('id', ParseIntPipe) room_id: number, @Param('login') login_banned: string): Promise<Boolean> {
    // console.log('body', body);
    console.log('removeUserBan Controller');
    const removeReturn = await this.MuteListService.removeRoomMute(room_id, login_banned);
    console.log('removeReturn Controller', removeReturn);
    return true;
  }

}
