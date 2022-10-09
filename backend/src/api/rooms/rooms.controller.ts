import { Body, Controller, Get, Inject, Param, ParseIntPipe, Post } from "@nestjs/common";
import { RoomsDto } from "./dtos/rooms.dto";
import { RoomsEntity } from "./rooms.entity";
import { RoomsService } from "./rooms.service";

@Controller('rooms')
export class RoomsController {
  @Inject(RoomsService)
  private readonly service: RoomsService;

  @Get()
  public getAllRooms(): Promise<{ id: number, name: string }[]> {
    return this.service.getAllRooms();
  }

  @Get('/check/:name')
  public async checkRoom(@Param('name') name: string): Promise<Boolean> {
    const returnCheck = await this.service.checkRoom(name);
    console.log('checkRoom Check = ', returnCheck);
    return returnCheck;
  }

  @Get('/checkIfOwner/:id/:name')
  public async checkIfOwner(@Param('id', ParseIntPipe) id: number, @Param('name') name: string): Promise<Boolean> {
    const returnCheck = await this.service.checkIfOwner(id, name);
    // console.log('checkIfOwner Check = ', returnCheck);
    return returnCheck;
  }

  @Post()
  public async createRoom(@Body() body: RoomsDto): Promise<RoomsEntity> {
    // console.log('body', body);
    const newRoom = await this.service.createRoom(body);
    return newRoom;
  }

  @Post('/:login/:roomName')
  public async removeRoom(@Param('id', ParseIntPipe) id: number, @Param('roomName') roomName: string): Promise<Boolean> {
    console.log('removeRoom Controller');
    const removeReturn = await this.service.removeRoom(id, roomName);
    console.log('removeRoom Controller', removeReturn);
    return true;
  }

  // @Get('/:id')
  // public getParticipantsRoom(@Param('id', ParseIntPipe) id: number): Promise<number[]> {
  //   return this.service.getParticipantsRoom(id);
  // }
}
