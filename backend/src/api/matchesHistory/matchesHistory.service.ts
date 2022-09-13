import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
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
			return null; // gestion d erreur needed
		return matches;
	}

	async getParsedUserMatchesHistory(id: number): Promise<{ login_user1: string, score_u1: number, login_user2: string, score_u2: number, winner_login: string, date: number }[]> {
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

			var login1 = (await this.userService.getUserById(matches[index].id_user1)).login;
			var login2 = (await this.userService.getUserById(matches[index].id_user2)).login;

			ret.push({
				login_user1: login1,
				score_u1: matches[index].score_u1,
				login_user2: login2,
				score_u2: matches[index].score_u2,
				winner_login: (matches[index].winner_id == matches[index].id_user1 ? login1 : login2),
				date: matches[index].date
			})
		}
		return ret;
	}


	//Recuperer les id des joueurs
	//Inserer les datas de base
	async createMatch(body: any): Promise<MatchesHistoryEntity> {
		const match = this.MatchesHistoryRepository.save({
			id_user1: body.id_user1,
			score_u1: body.score_u1,
			id_user2: body.id_user2,
			score_u2: body.score_u2,
			winner_id: body.winner_id,
			date: new Date()
		}
		)
		if (!match)
			return null;
		return match;
	}

}
