import { Body, Controller, Get, Inject, Param, ParseIntPipe, Post } from "@nestjs/common";
import { FriendListDto } from "./dtos/friendList.dto";
import { FriendListEntity } from "./friendList.entity";
import { FriendListService } from "./friendList.service";

@Controller('friendList')
export class FriendListController {
  @Inject(FriendListService)
  private readonly service: FriendListService;

  @Get()
  public getAllFriendList(): Promise<FriendListEntity[]> {
    return this.service.getAllFriendList();
  }


  //Changer en methode post
  //Utiliser Req: Express
  //Utiliser le UseGuard('jwt')
  //Recuperer l'id et faire le reste
  @Get('/:id')
  public getUserFriendList(@Param('id', ParseIntPipe) id: number): Promise<FriendListEntity[]> {
    return this.service.getUserFriendList(id);
  }

  @Post()
  public createFriendShip(@Body() body: FriendListDto): Promise<FriendListEntity> {
    console.log('body', body)
    const match = this.service.createFriendShip(body);
    if (!match)
      return null;
    return match;
  }
}
