import { Body, Controller, Get, Inject, Param, ParseIntPipe, Post, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ParticipantsDto } from "./dtos/participants.dto";
import { ParticipantsEntity } from "./participants.entity";
import { ParticipantsService } from "./participants.service";

@Controller('participants')
export class ParticipantsController {
  @Inject(ParticipantsService)
  private readonly service: ParticipantsService;

  @Get()
  @UseGuards(AuthGuard('jwt'))
  public getAllParticipants(): Promise<{ login: string, room_name: string }[]> {
    return this.service.getAllParticipants();
  }

  @Get('/:id')
  @UseGuards(AuthGuard('jwt'))
  public getAllRoomParticipants(@Param('id', ParseIntPipe) id: number): Promise<ParticipantsEntity[]> {
    if (id)
      return this.service.getAllRoomParticipants(id);
    else
      return null;
  }

  @Get('/userRooms/:login')
  @UseGuards(AuthGuard('jwt'))
  public getAllRoomUser(@Param('login') login: string): Promise<{ name: string, id: number }[]> {
    if (login.length <= 8 && login.length > 0) {
      for (let i = 0; i < login.length; i++) {
        var char1 = login.charAt(i);
        var cc = char1.charCodeAt(0);

        if (!((cc > 96 && cc < 123) || cc == 45))
          return null;
      }
      return this.service.getAllRoomUser(login);
    }
    return null;
  }

  @Get('/allUserForOneRoom/:roomName')
  @UseGuards(AuthGuard('jwt'))
  public getAllUsersForOneRoom(@Param('roomName') name: string): Promise<{ login: string, id: number, admin: boolean }[]> {
    if (name.length > 0 && name.length <= 15) {
      for (let i = 0; i < name.length; i++) {
        var char1 = name.charAt(i);
        var cc = char1.charCodeAt(0);

        if (!((cc > 96 && cc < 123) || (cc > 40 && cc < 91) || (cc > 47 && cc < 58)))
          return null;
      }
      return this.service.getAllUsersForOneRoom(name);
    }
    return null;
  }

  @Get('/check/:login/:name')
  @UseGuards(AuthGuard('jwt'))
  public async checkParticipant(@Param('login') login: string, @Param('name') name: string): Promise<boolean> {
    if (login.length <= 8 && login.length > 0) {
      for (let i = 0; i < login.length; i++) {
        var char1 = login.charAt(i);
        var cc = char1.charCodeAt(0);

        if (!((cc > 96 && cc < 123) || cc == 45))
          return null;
      }
      if (name.length > 0 && name.length <= 15) {
        for (let i = 0; i < name.length; i++) {
          var char1 = name.charAt(i);
          var cc = char1.charCodeAt(0);
  
          if (!((cc > 96 && cc < 123) || (cc > 40 && cc < 91) || (cc > 47 && cc < 58)))
            return null;
        }
        const returnCheck = await this.service.checkParticipant(login, name);
        return returnCheck;
      }
    }
    return null;
  }

  @Get('/checkAdmin/:login/:name')
  @UseGuards(AuthGuard('jwt'))
  public async checkIfAdmin(@Param('login') login: string, @Param('name') name: string): Promise<boolean> {
    if (login.length <= 8 && login.length > 0) {
      for (let i = 0; i < login.length; i++) {
        var char1 = login.charAt(i);
        var cc = char1.charCodeAt(0);

        if (!((cc > 96 && cc < 123) || cc == 45))
          return null;
      }
      if (name.length > 0 && name.length <= 15) {
        for (let i = 0; i < name.length; i++) {
          var char1 = name.charAt(i);
          var cc = char1.charCodeAt(0);
  
          if (!((cc > 96 && cc < 123) || (cc > 40 && cc < 91) || (cc > 47 && cc < 58)))
            return null;
        }
        const returnCheck = await this.service.checkAdmin(login, name);
        return returnCheck;
      }
    }
    return null;
  }
}
