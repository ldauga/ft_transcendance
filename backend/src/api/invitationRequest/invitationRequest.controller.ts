import { Body, Controller, Get, Inject, Param, ParseIntPipe, Post } from "@nestjs/common";
import { InvitationRequestDto } from "./dtos/invitationRequest.dto";
import { InvitationRequestEntity } from "./invitationRequest.entity";
import { invitationRequestService } from "./invitationRequest.service";

@Controller('invitationRequest')
export class InvitationRequestController {
  @Inject(invitationRequestService)
  private readonly service: invitationRequestService;

  @Get()
  public getAllInvitationRequest(): Promise<InvitationRequestEntity[]> {
    return this.service.getAllInvitationRequest();
  }


  //Changer en methode post
  //Utiliser Req: Express
  //Utiliser le UseGuard('jwt')
  //Recuperer l'id et faire le reste
  // @Get('/:id')
  // public getUserFriendList(@Param('id', ParseIntPipe) id: number): Promise<InvitationRequestEntity[]> {
  //   return this.service.getUserInvitationRequest(id);
  // }

  @Post()
  public createInvitationRequest(@Body() body: InvitationRequestDto): Promise<InvitationRequestEntity> {
    console.log('body', body)
    const match = this.service.createInvitationRequest(body);
    if (!match)
      return null;
    return match;
  }
}
