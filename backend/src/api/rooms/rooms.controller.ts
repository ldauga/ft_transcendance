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
    const returnCheck = await this.service.checkRoom(name);
    console.log('checkRoom Check = ', returnCheck);
    return returnCheck;
  }

  @Get('/:user_id/:user_login/:room_id/:room_name/:password/')
  @UseGuards(AuthGuard('jwt'))
  public async checkIfCanJoin(@Param('user_id', ParseIntPipe) user_id: number, @Param('user_login') user_login: string, @Param('room_id', ParseIntPipe) room_id: number, @Param('room_name') room_name: string, @Param('password') password: string): Promise<String> {
    const returnCheck = await this.service.checkIfCanJoin(user_id, user_login, room_id, room_name, password);
    console.log('checkRoom Check = ', returnCheck);
    return returnCheck;
  }

  @Get('/checkIfOwner/:id/:name')
  @UseGuards(AuthGuard('jwt'))
  public async checkIfOwner(@Param('id', ParseIntPipe) id: number, @Param('name') name: string): Promise<boolean> {
    const returnCheck = await this.service.checkIfOwner(id, name);
    // console.log('checkIfOwner Check = ', returnCheck);
    return returnCheck;
  }
}
