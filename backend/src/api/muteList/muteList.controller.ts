import { Body, Controller, Get, Inject, Param, ParseIntPipe, Post } from "@nestjs/common";
import { MuteListDto } from "./dtos/muteList.dto";
import { MuteListEntity } from "./muteList.entity";
import { MuteListService } from "./muteList.service";

@Controller('muteList')
export class MuteListController {
  @Inject(MuteListService)
  private readonly MuteListService: MuteListService;

  @Get()
  public getAllMute(): Promise<{ login_muted: string, userOrRoom: boolean, id_sender: number, room_id: number, date: number, timer: number }[]> {
    return this.MuteListService.getAllMuteTimer();
  }

  @Get('/checkUserMute/:login/:loginReceiver')
  public async checkUserMute(@Param('login') login: string, @Param('loginReceiver') loginReceiver: string): Promise<Boolean> {
    const returnCheck = await this.MuteListService.checkUserMute(login, loginReceiver);
    console.log('checkUserMuteReturn Check = ', returnCheck);
    return returnCheck;
  }

  @Get('/checkRoomMute/:id/:login/:roomName')
  public async checkRoomMute(@Param('id', ParseIntPipe) id: number, @Param('login') login: string, @Param('roomName') roomName: string): Promise<Boolean> {
    const returnCheck = await this.MuteListService.checkRoomMute(id, login, roomName);
    console.log('checkRoomMuteReturn Check = ', returnCheck);
    return returnCheck;
  }

  @Post()
  public async createMute(@Body() body: MuteListDto): Promise<MuteListEntity> {
    const newMute = await this.MuteListService.createMute(body);
    return newMute;
  }

  @Post('/removeUserMute/:id/:login')
  public async removeUserMute(@Param('id', ParseIntPipe) id_sender: number, @Param('login') login_muted: string): Promise<Boolean> {
    // console.log('body', body);
    console.log('removeUserMute Controller');
    const removeReturn = await this.MuteListService.removeUserMute(id_sender, login_muted);
    console.log('removeReturn Controller', removeReturn);
    return true;
  }

  @Post('/removeRoomMute/:id/:login')
  public async removeRoomMute(@Param('id', ParseIntPipe) room_id: number, @Param('login') login_muted: string): Promise<Boolean> {
    // console.log('body', body);
    console.log('removeUserMute Controller');
    const removeReturn = await this.MuteListService.removeRoomMute(room_id, login_muted);
    console.log('removeReturn Controller', removeReturn);
    return true;
  }

}
