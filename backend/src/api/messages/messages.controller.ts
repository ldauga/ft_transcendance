import { Body, Controller, Get, Inject, Param, ParseIntPipe, Post } from "@nestjs/common";
import { MessagesDto } from "./dtos/messages.dto";
import { MessagesEntity } from "./messages.entity";
import { MessagesService } from "./messages.service";

@Controller('messages')
export class MessagesController {
  @Inject(MessagesService)
  private readonly service: MessagesService;

  @Get()
  public getAllMessages(): Promise<MessagesEntity[]> {
    return this.service.getAllMessages();
  }

  @Get('/:id')
  public getUserMessages(@Param('id', ParseIntPipe) id: number): Promise<MessagesEntity[]> {
    return this.service.getUserMessages(id);
  }

  @Get('/:id1/:id2')
  public getConversMessages(@Param('id1', ParseIntPipe) id1: number, @Param('id2', ParseIntPipe) id2: number): Promise<MessagesEntity[]> {
    return this.service.getConversMessages(id1, id2);
  }

  @Get('/room/:room_id')
  public getRoomConversMessages(@Param('room_id', ParseIntPipe) id: number): Promise<MessagesEntity[]> {
    return this.service.getRoomConversMessages(id);
  }

  @Get('/:id1/:id2/room')
  public getTestConversMessages(@Param('id1', ParseIntPipe) id1: number, @Param('id2', ParseIntPipe) id2: number): Promise<MessagesEntity[]> {
    return this.service.getRoomConversMessages(id1);
  }

  // @Get('/relation/:id')
  // public getRelationMessages(@Param('id', ParseIntPipe) id: number): Promise<number> {
  //   // return this.service.getRelationMessages(id);
  //   return 1;
  // }

  // @Get('/id/:id')
  // public async getRelationMessages(@Param('id', ParseIntPipe) id: number): Promise<Boolean> {
  //   const returnCheck = await this.service.getRelationMessages(id);
  //   if (returnCheck)
  //     return true;
  //   return false;
  // }

  @Get('/:id1/:id2/:id3')
  public getUser(@Param('id1', ParseIntPipe) id1: number, @Param('id2', ParseIntPipe) id2: number, @Param('id3', ParseIntPipe) id3: number): Promise<{ id: number, login: string }[]> {
    const returnCheck = this.service.getRelationMessages(id1);
    return returnCheck;
  }

  @Post()
  public createMessages(@Body() body: MessagesDto): Promise<MessagesEntity> {
    console.log('body createMessages: ', body);
    const newMessage = this.service.createMessages(body);
    if (!newMessage)
      return null;
    return newMessage;
  }

  @Post('/removeAllRoomMessages/')
  public removeAllRoomMessages(@Body() body: { room_id: number, room_name: string }): Promise<Boolean> {
    console.log('body removeAllRoomMessages: ', body);
    const newMessage = this.service.removeAllRoomMessages(body.room_id, body.room_name);
    if (!newMessage)
      return null;
    return newMessage;
  }
}
