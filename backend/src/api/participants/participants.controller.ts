import { Body, Controller, Get, Inject, Param, ParseIntPipe, Post } from "@nestjs/common";
import { ParticipantsDto } from "./dtos/participants.dto";
import { ParticipantsEntity } from "./participants.entity";
import { ParticipantsService } from "./participants.service";

@Controller('participants')
export class ParticipantsController {
  @Inject(ParticipantsService)
  private readonly service: ParticipantsService;

  @Get()
  public getAllParticipants(): Promise<{ login: string, room_name: string }[]> {
    return this.service.getAllParticipants();
  }

  @Get('/:id')
  public getAllRoomParticipants(@Param('id', ParseIntPipe) id: number): Promise<ParticipantsEntity[]> {
    return this.service.getAllRoomParticipants(id);
  }

  @Get('/userRooms/:login')
  public getAllRoomUser(@Param('login') login: string): Promise<{ name: string, id: number }[]> {
    return this.service.getAllRoomUser(login);
  }

  @Get('/allUserForOneRoom/:roomName')
  public getAllUsersForOneRoom(@Param('roomName') name: string): Promise<{ login: string, id: number }[]> {
    return this.service.getAllUsersForOneRoom(name);
  }

  @Get('/check/:login/:name')
  public async checkParticipant(@Param('login') login: string, @Param('name') name: string): Promise<Boolean> {
    const returnCheck = await this.service.checkParticipant(login, name);
    console.log('checkParticipant Check = ', returnCheck);
    return returnCheck;
  }

  @Get('/checkAdmin/:login/:name')
  public async checkIfAdmin(@Param('login') login: string, @Param('name') name: string): Promise<Boolean> {
    const returnCheck = await this.service.checkAdmin(login, name);
    console.log('checkAdmin Check = ', returnCheck);
    return returnCheck;
  }

  @Get('/checkIfAdminOrParticipant/:login/:name')
  public async checkIfAdminOrParticipant(@Param('login') login: string, @Param('name') name: string): Promise<Boolean> {
    const returnCheck = await this.service.checkIfAdminOrParticipant(login, name);
    console.log('checkIfAdminOrParticipant Check = ', returnCheck);
    return returnCheck;
  }

  @Post('/admin')
  public async createAdmin(@Body() body: ParticipantsDto): Promise<ParticipantsEntity> {
    console.log('body', body);
    const newParticipant = await this.service.createAdmin(body);
    return newParticipant;
  }

  @Post()
  public async createParticipant(@Body() body: ParticipantsDto): Promise<ParticipantsEntity> {
    console.log('body', body);
    const newParticipant = await this.service.createParticipant(body);
    return newParticipant;
  }

  @Post('/:login/:roomName')
  public async removeParticipant(@Param('login') login: string, @Param('roomName') roomName: string): Promise<Boolean> {
    console.log('removeParticipant Controller login: ', login, ", roomName: ", roomName);
    const removeReturn = await this.service.removeParticipant(login, roomName);
    console.log('removeRParticipanteturn Controller', removeReturn);
    return true;
  }
}
