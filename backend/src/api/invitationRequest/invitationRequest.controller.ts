import { Body, Controller, Get, Inject, Param, ParseIntPipe, Post, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { InvitationRequestDto } from "./dtos/invitationRequest.dto";
import { InvitationRequestEntity } from "./invitationRequest.entity";
import { InvitationRequestService } from "./invitationRequest.service";

@Controller('invitationRequest')
export class InvitationRequestController {
  @Inject(InvitationRequestService)
  private readonly invitationRequestService: InvitationRequestService;

  @Get()
  @UseGuards(AuthGuard('jwt'))
  public getAllInvitationRequest(): Promise<InvitationRequestEntity[]> {
    return this.invitationRequestService.getAllInvitationRequest();
  }

  @Get('/:id')
  @UseGuards(AuthGuard('jwt'))
  public getUserInvitationRequest(@Param('id', ParseIntPipe) id: number): Promise<InvitationRequestEntity[]> {
    if (id){
      return this.invitationRequestService.getUserInvitationRequest(id);
    }
    else
      return null;
  }

  @Get('/:id1/:id2')
  @UseGuards(AuthGuard('jwt'))
  public async checkInvitationRequest(@Param('id1', ParseIntPipe) id1: number, @Param('id2', ParseIntPipe) id2: number): Promise<boolean> {
    if (id1 && id2){
      const returnCheck = await this.invitationRequestService.checkInvitationRequest(id1, id2);
      return returnCheck;
    }
    else
      return null;
  }

  @Get('/checkInvitationRequestForRooms/:id/:roomName')
  @UseGuards(AuthGuard('jwt'))
  public async checkInvitationRequestForRooms(@Param('id', ParseIntPipe) id: number, @Param('roomName') roomName: string): Promise<boolean> {
    if (id && roomName.length > 0 && roomName.length <= 15) {
      for (let i = 0; i < roomName.length; i++) {
        var char1 = roomName.charAt(i);
        var cc = char1.charCodeAt(0);

        if (!((cc > 96 && cc < 123) || (cc > 40 && cc < 91) || (cc > 47 && cc < 58)))
          return null;
      }
      const returnCheck = await this.invitationRequestService.checkInvitationRequestForRooms(id, roomName);
      return returnCheck;
    }
    return null;
  }
}
