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
    return this.service.getUserFriendList(id);
  }

  @Get('/:id1/:id2')
  @UseGuards(AuthGuard('jwt'))
  public checkFriendList(@Param('id1', ParseIntPipe) id1: number, @Param('id2', ParseIntPipe) id2: number): Promise<boolean> {
    console.log("checkExistRelation");
    return this.service.checkExistRelation(id1, id2);
  }

  @Post('/:id1/:id2')
  @UseGuards(AuthGuard('jwt'))
  public async removeFriendShip(@Param('id1', ParseIntPipe) id1: number, @Param('id2', ParseIntPipe) id2: number): Promise<boolean> {
    console.log('removeFriendShip Controller');
    const removeReturn = await this.service.removeFriendShip(id1, id2);
    console.log('removeReturn Controller', removeReturn);
    return true;
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  public createFriendShip(@Body() body: FriendListDto): Promise<FriendListEntity> {
    console.log('body', body)
    const match = this.service.createFriendShip(body);
    if (!match)
      return null;
    return match;
  }
}
