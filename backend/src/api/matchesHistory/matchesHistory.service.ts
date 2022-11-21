import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UpdateWinLooseDto } from "../user/dtos/updateWinLoose.dto";
import { UserService } from "../user/user.service";
import { MatchesHistoryDto } from "./dtos/matchesHistory.dto";
import { MatchesHistoryEntity } from "./matchesHistory.entity";

@Injectable()
export class MatchesHistoryService {
	constructor(
		@InjectRepository(MatchesHistoryEntity)
		private readonly MatchesHistoryRepository: Repository<MatchesHistoryEntity>,
		private userService: UserService
	) { }

	private logger: Logger = new Logger('MatchesHistory');

	public getAllMatchesHistory(): Promise<MatchesHistoryEntity[]> {
		return this.MatchesHistoryRepository.find();
	}

	async getUserMatchesHistory(id: number): Promise<MatchesHistoryEntity[]> {
		const matches = await this.MatchesHistoryRepository.find({
			where: [
				{ id_user1: id },
				{ id_user2: id }
			]
		});

		if (!matches)
			return null;
		return matches;
	}

	async getParsedUserMatchesHistory(id: number): Promise<{ nickname_user1: string, score_u1: number, nickname_user2: string, score_u2: number, winner_login: string, date: number }[]> {
		const matches = await this.MatchesHistoryRepository.find({
			where: [
				{ id_user1: id },
				{ id_user2: id }
			]
		});

		if (!matches)
			return null;

		var ret = new Array()

		for (let index = 0; index < matches.length; index++) {

			var user1 = (await this.userService.getUserById(matches[index].id_user1));
			var user2 = (await this.userService.getUserById(matches[index].id_user2));

			ret.push({
				nickname_user1: user1.nickname,
				login_user1: user1.login,
				score_u1: matches[index].score_u1,
				nickname_user2: user2.nickname,
				login_user2: user2.login,
				score_u2: matches[index].score_u2,
				winner_nickname: (matches[index].winner_id == matches[index].id_user1 ? user1.nickname : user2.nickname),
				date: matches[index].date
			})
		}
		return ret;
	}

	async createMatch(body: any): Promise<MatchesHistoryEntity> {
		const match = await this.MatchesHistoryRepository.save({
			id_user1: body.id_user1,
			score_u1: body.score_u1,
			id_user2: body.id_user2,
			score_u2: body.score_u2,
			winner_id: body.winner_id,
			date: new Date()
		})
		
		if (!match)
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
