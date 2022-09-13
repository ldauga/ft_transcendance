import { Body, Controller, Get, Inject, Param, ParseIntPipe, Post } from "@nestjs/common";
import { UpdateWinLooseDto } from "../user/dtos/updateWinLoose.dto";
import { UserService } from "../user/user.service";
import { MatchesHistoryDto } from "./dtos/matchesHistory.dto";
import { MatchesHistoryEntity } from "./matchesHistory.entity";
import { MatchesHistoryService } from "./matchesHistory.service";

@Controller('matchesHistory')
export class MatchesHistoryController {
  constructor(
		private userService: UserService
	) {}

  @Inject(MatchesHistoryService)
  private readonly MatchesHistoryService: MatchesHistoryService;

  @Get()
  public getAllMatchesHistory(): Promise<MatchesHistoryEntity[]> {
    return this.MatchesHistoryService.getAllMatchesHistory();
  }


  //Changer en methode post
  //Utiliser Req: Express
  //Utiliser le UseGuard('jwt')
  //Recuperer l'id et faire le reste
  @Get('/:id')
  public getUserMatchesHistory(@Param('id', ParseIntPipe) id: number): Promise<MatchesHistoryEntity[]> {
  	return this.MatchesHistoryService.getUserMatchesHistory(id);
  }

  @Get('parsedMatchesHistory/:id')
  public async getParsedUserMatchesHistory(@Param('id', ParseIntPipe) id: number): Promise<{login_user1: string, score_u1: number, login_user2: string, score_u2: number, winner_login: string}[]> {
    return this.MatchesHistoryService.getParsedUserMatchesHistory(id);
  }

  @Post()
  public async createMatch(@Body() body: MatchesHistoryDto): Promise<MatchesHistoryEntity> {
    console.log('body', body)
	  const match = await this.MatchesHistoryService.createMatch(body);
    if(!match)
      return null;
    const toSend = new UpdateWinLooseDto()

    toSend.id = match.id_user1
    toSend.win = (match.id_user1 == match.winner_id)
    await this.userService.updateWinLoose(toSend)
    
    toSend.id = match.id_user2
    toSend.win = (match.id_user2 == match.winner_id)
    await this.userService.updateWinLoose(toSend)

    return match;
  }
}
