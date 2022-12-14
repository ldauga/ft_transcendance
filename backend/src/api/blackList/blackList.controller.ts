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

  @Get('/getAllRoomBan/:roomId/:roomName') //used
  public getAllRoomBan(@Param('roomId', ParseIntPipe) roomId: number, @Param('roomName') roomName: string): Promise<{ id_banned: number, login_banned: string }[]> {
    return this.BlackListService.getAllRoomBan(roomId, roomName);
  }

  @Get('/getAllUserBan/:id/:login')
  public getAllUserBan(@Param('id', ParseIntPipe) id: number, @Param('login') login: string): Promise<{ id_banned: number, login_banned: string }[]> {
    return this.BlackListService.getAllUserBan(id, login);
  }

  @Get('/checkIfRelationIsBlocked/:login1/:login2')
  @UseGuards(AuthGuard('jwt'))
  public async checkIfRelationIsBlocked(@Param('login1') login1: string, @Param('login2') login2: string): Promise<boolean> {
    const returnCheck = await this.BlackListService.checkIfRelationIsBlocked(login1, login2);
    return returnCheck;
  }

  @Get('/checkUserBan/:login/:loginReceiver')
  @UseGuards(AuthGuard('jwt'))
  public async checkUserBan(@Param('login') login: string, @Param('loginReceiver') loginReceiver: string): Promise<boolean> {
    const returnCheck = await this.BlackListService.checkUserBan(login, loginReceiver);
    return returnCheck;
  }

  @Get('/checkRoomBan/:id/:login/:roomName')
  @UseGuards(AuthGuard('jwt'))
  public async checkRoomBan(@Param('id', ParseIntPipe) id: number, @Param('login') login: string, @Param('roomName') roomName: string): Promise<boolean> {
    const returnCheck = await this.BlackListService.checkRoomBan(id, login, roomName);
    return returnCheck;
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  public async createBan(@Body() body: BlackListDto): Promise<BlackListEntity> {
    const newBan = await this.BlackListService.createBan(body);
    return newBan;
  }

}
