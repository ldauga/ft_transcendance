import { Body, Controller, Get, Inject, Param, ParseIntPipe, Post } from "@nestjs/common";
import { BlackListDto } from "./dtos/blackList.dto";
import { BlackListEntity } from "./blackList.entity";
import { BlackListService } from "./blackList.service";

@Controller('blackList')
export class BlackListController {
  @Inject(BlackListService)
  private readonly BlackListService: BlackListService;

  @Get()
  public getAllBan(): Promise<{ login_banned: string, userOrRoom: boolean, id_sender: number, room_id: number, date: number, timer: number }[]> {
    return this.BlackListService.getAllBanTimer();
  }

  @Get('/getAllRoomBan/:roomId/:roomName')
  public getAllRoomBan(@Param('roomId', ParseIntPipe) roomId: number, @Param('roomName') roomName: string): Promise<{ id_banned: number, login_banned: string }[]> {
    return this.BlackListService.getAllRoomBan(roomId, roomName);
  }

  @Get('/checkUserBan/:login/:loginReceiver')
  public async checkUserBan(@Param('login') login: string, @Param('loginReceiver') loginReceiver: string): Promise<Boolean> {
    const returnCheck = await this.BlackListService.checkUserBan(login, loginReceiver);
    console.log('checkUserBanReturn Check = ', returnCheck);
    return returnCheck;
  }

  @Get('/checkRoomBan/:id/:login/:roomName')
  public async checkRoomBan(@Param('id', ParseIntPipe) id: number, @Param('login') login: string, @Param('roomName') roomName: string): Promise<Boolean> {
    const returnCheck = await this.BlackListService.checkRoomBan(id, login, roomName);
    console.log('checkRoomBanReturn Check = ', returnCheck);
    return returnCheck;
  }

  @Post()
  public async createBan(@Body() body: BlackListDto): Promise<BlackListEntity> {
    const newBan = await this.BlackListService.createBan(body);
    return newBan;
  }

  @Post('/removeUserBan/:id/:login')
  public async removeUserBan(@Param('id', ParseIntPipe) id_sender: number, @Param('login') login_banned: string): Promise<Boolean> {
    // console.log('body', body);
    console.log('removeUserBan Controller');
    const removeReturn = await this.BlackListService.removeUserBan(id_sender, login_banned);
    console.log('removeReturn Controller', removeReturn);
    return true;
  }

  @Post('/removeRoomBan/:id/:login')
  public async removeRoomBan(@Param('id', ParseIntPipe) room_id: number, @Param('login') login_banned: string): Promise<Boolean> {
    // console.log('body', body);
    console.log('removeUserBan Controller');
    const removeReturn = await this.BlackListService.removeRoomBan(room_id, login_banned);
    console.log('removeReturn Controller', removeReturn);
    return true;
  }

}
