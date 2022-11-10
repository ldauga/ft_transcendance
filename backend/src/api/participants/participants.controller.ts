import { Body, Controller, Get, Inject, Param, ParseIntPipe, Post, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ParticipantsDto } from "./dtos/participants.dto";
import { ParticipantsEntity } from "./participants.entity";
import { ParticipantsService } from "./participants.service";

@Controller('participants')
export class ParticipantsController {
  @Inject(ParticipantsService)
  private readonly service: ParticipantsService;

  //FAIRE FONCTIONNER AVEC LES GUARDS
  @Get()
  public getAllParticipants(): Promise<{ login: string, room_name: string }[]> {
    return this.service.getAllParticipants();
  }

  @Get('/:id')
  @UseGuards(AuthGuard('jwt'))
  public getAllRoomParticipants(@Param('id', ParseIntPipe) id: number): Promise<ParticipantsEntity[]> {
    return this.service.getAllRoomParticipants(id);
  }

  @Get('/userRooms/:login')
  @UseGuards(AuthGuard('jwt'))
  public getAllRoomUser(@Param('login') login: string): Promise<{ name: string, id: number }[]> {
    return this.service.getAllRoomUser(login);
  }

  @Get('/allUserForOneRoom/:roomName')
  @UseGuards(AuthGuard('jwt'))
  public getAllUsersForOneRoom(@Param('roomName') name: string): Promise<{ login: string, id: number, admin: boolean }[]> {
    return this.service.getAllUsersForOneRoom(name);
  }

  @Get('/check/:login/:name')
  @UseGuards(AuthGuard('jwt'))
  public async checkParticipant(@Param('login') login: string, @Param('name') name: string): Promise<boolean> {
    const returnCheck = await this.service.checkParticipant(login, name);
    //console.log('checkParticipant Check = ', returnCheck);
    return returnCheck;
  }

  @Get('/checkAdmin/:login/:name')
  @UseGuards(AuthGuard('jwt'))
  public async checkIfAdmin(@Param('login') login: string, @Param('name') name: string): Promise<boolean> {
    const returnCheck = await this.service.checkAdmin(login, name);
    // console.log('checkAdmin Check = ', returnCheck);
    return returnCheck;
  }
}
