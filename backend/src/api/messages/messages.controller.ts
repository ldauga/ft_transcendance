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
    return this.service.getRoomConversMessages(id);
  }

  @Get('/:id')
  @UseGuards(AuthGuard('jwt'))
  public getUserMessages(@Param('id', ParseIntPipe) id: number): Promise<MessagesEntity[]> {
    return this.service.getUserMessages(id);
  }

  @Get('/getUsersRoomConversMessages/:name')
  @UseGuards(AuthGuard('jwt'))
  public getUsersRoomConversMessages(@Param('name') name: string): Promise<{ login: string, id: number }[]> {
    return this.service.getUsersRoomConversMessages(name);
  }

  @Get('/:id1/:id2')
  @UseGuards(AuthGuard('jwt'))
  public getConversMessages(@Param('id1', ParseIntPipe) id1: number, @Param('id2', ParseIntPipe) id2: number): Promise<MessagesEntity[]> {
    return this.service.getConversMessages(id1, id2);
  }

  @Get('/:id1/:id2/:id3')
  @UseGuards(AuthGuard('jwt'))
  public getUser(@Param('id1', ParseIntPipe) id1: number, @Param('id2', ParseIntPipe) id2: number, @Param('id3', ParseIntPipe) id3: number): Promise<any[]> {
    const returnCheck = this.service.getRelationMessages(id1);
    return returnCheck;
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  public getAllMessages(): Promise<MessagesEntity[]> {
    return this.service.getAllMessages();
  }
}
