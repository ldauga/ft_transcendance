import { Body, Controller, Get, Inject, Param, ParseIntPipe, Post, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
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
  @UseGuards(AuthGuard('jwt'))
  public getAllMatchesHistory(): Promise<MatchesHistoryEntity[]> {
    return this.MatchesHistoryService.getAllMatchesHistory();
  }


  @Get('/:id')
  @UseGuards(AuthGuard('jwt'))
  public getUserMatchesHistory(@Param('id', ParseIntPipe) id: number): Promise<MatchesHistoryEntity[]> {
    if (id)
  	  return this.MatchesHistoryService.getUserMatchesHistory(id);
    else
      return null;
  }

  @Get('parsedMatchesHistory/:id')
  @UseGuards(AuthGuard('jwt'))
  public async getParsedUserMatchesHistory(@Param('id', ParseIntPipe) id: number): Promise<{nickname_user1: string, score_u1: number, nickname_user2: string, score_u2: number, winner_login: string, date: number}[]> {
    if (id)
      return this.MatchesHistoryService.getParsedUserMatchesHistory(id);
    else
      return null;
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  public async createMatch(@Body() body: MatchesHistoryDto): Promise<MatchesHistoryEntity> {
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
