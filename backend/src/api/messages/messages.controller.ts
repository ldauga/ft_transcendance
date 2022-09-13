import { Body, Controller, Get, Inject, Param, ParseIntPipe, Post } from "@nestjs/common";
import { MessagesDto } from "./dtos/messages.dto";
import { MessagesEntity } from "./messages.entity";
import { MessagesService } from "./messages.service";

@Controller('messages')
export class MessagesController {
  @Inject(MessagesService)
  private readonly service: MessagesService;

  @Get()
  public getAllMatchesHistory(): Promise<MessagesEntity[]> {
    return this.service.getAllMatchesHistory();
  }


  //Changer en methode post
  //Utiliser Req: Express
  //Utiliser le UseGuard('jwt')
  //Recuperer l'id et faire le reste
  @Get('/:id')
  public getUserMatchesHistory(@Param('id', ParseIntPipe) id: number): Promise<MessagesEntity[]> {
    return this.service.getUserMatchesHistory(id);
  }

  @Post()
  public createMatch(@Body() body: MessagesDto): Promise<MessagesEntity> {
    console.log('body', body)
    const match = this.service.createMatch(body);
    if (!match)
      return null;
    return match;
  }
}
