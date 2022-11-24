import { Body, Controller, Get, Inject, Param, ParseIntPipe, Post, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { MessagesDto } from "./dtos/messages.dto";
import { MessagesEntity } from "./messages.entity";
import { MessagesService } from "./messages.service";

@Controller('messages')
export class MessagesController {
  @Inject(MessagesService)
  private readonly service: MessagesService;

  @Get('/room/:room_id')
  @UseGuards(AuthGuard('jwt'))
  public getRoomConversMessages(@Param('room_id', ParseIntPipe) id: number): Promise<MessagesEntity[]> {
    if (id)
      return this.service.getRoomConversMessages(id);
    else
      return null;
  }

  @Get('/:id')
  @UseGuards(AuthGuard('jwt'))
  public getUserMessages(@Param('id', ParseIntPipe) id: number): Promise<MessagesEntity[]> {
    if (id)
      return this.service.getUserMessages(id);
    else
      return null;
  }

  @Get('/getUsersRoomConversMessages/:name')
  @UseGuards(AuthGuard('jwt'))
  public getUsersRoomConversMessages(@Param('name') name: string): Promise<{ login: string, id: number }[]> {
    if (name.length > 0 && name.length <= 15) {
      for (let i = 0; i < name.length; i++) {
        var char1 = name.charAt(i);
        var cc = char1.charCodeAt(0);

        if (!((cc > 96 && cc < 123) || (cc > 40 && cc < 91) || (cc > 47 && cc < 58)))
          return null;
      }
      return this.service.getUsersRoomConversMessages(name);
    }
    return null;
  }

  @Get('/:id1/:id2')
  @UseGuards(AuthGuard('jwt'))
  public getConversMessages(@Param('id1', ParseIntPipe) id1: number, @Param('id2', ParseIntPipe) id2: number): Promise<MessagesEntity[]> {
    if (id1 && id2)
      return this.service.getConversMessages(id1, id2);
    else
      return null;
  }

  @Get('/:id1/:id2/:id3')
  @UseGuards(AuthGuard('jwt'))
  public getUser(@Param('id1', ParseIntPipe) id1: number, @Param('id2', ParseIntPipe) id2: number, @Param('id3', ParseIntPipe) id3: number): Promise<any[]> {
    if (id1 && id2 && id3) {
      const returnCheck = this.service.getRelationMessages(id1);
      return returnCheck;
    }
    else
      return null;
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  public getAllMessages(): Promise<MessagesEntity[]> {
    return this.service.getAllMessages();
  }
}
