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
    return this.invitationRequestService.getUserInvitationRequest(id);
  }

  @Get('/:id1/:id2')
  @UseGuards(AuthGuard('jwt'))
  public async checkInvitationRequest(@Param('id1', ParseIntPipe) id1: number, @Param('id2', ParseIntPipe) id2: number): Promise<boolean> {
    const returnCheck = await this.invitationRequestService.checkInvitationRequest(id1, id2);
    console.log('checkInvitationRequest Check = ');
    console.log(returnCheck);
    return returnCheck;
  }

  @Get('/checkInvitationRequestForRooms/:id/:roomName')
  @UseGuards(AuthGuard('jwt'))
  public async checkInvitationRequestForRooms(@Param('id', ParseIntPipe) id: number, @Param('roomName') roomName: string): Promise<boolean> {
    const returnCheck = await this.invitationRequestService.checkInvitationRequestForRooms(id, roomName);
    console.log('checkInvitationRequestForRooms Check = ', returnCheck);
    return returnCheck;
  }
}
