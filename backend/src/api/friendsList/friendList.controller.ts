import { Body, Controller, Get, Inject, Param, ParseIntPipe, Post, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { FriendListDto } from "./dtos/friendList.dto";
import { FriendListEntity } from "./friendList.entity";
import { FriendListService } from "./friendList.service";

@Controller('friendList')
export class FriendListController {
  @Inject(FriendListService)
  private readonly service: FriendListService;

  @Get()
  @UseGuards(AuthGuard('jwt'))
  public getAllFriendList(): Promise<FriendListEntity[]> {
    return this.service.getAllFriendList();
  }

  @Get('/:id')
  @UseGuards(AuthGuard('jwt'))
  public getUserFriendList(@Param('id', ParseIntPipe) id: number): Promise<FriendListEntity[]> {
    if (id)
      return this.service.getUserFriendList(id);
    else
      return null;
  }

  @Get('/:id1/:id2')
  @UseGuards(AuthGuard('jwt'))
  public checkFriendList(@Param('id1', ParseIntPipe) id1: number, @Param('id2', ParseIntPipe) id2: number): Promise<boolean> {
    if (id1 && id2){
      return this.service.checkExistRelation(id1, id2);
    }
    else
      return null;
  }
}
