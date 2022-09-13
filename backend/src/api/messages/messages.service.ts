import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { MessagesDto } from "./dtos/messages.dto";
import { MessagesEntity } from "./messages.entity";

@Injectable()
export class MessagesService {
	constructor(
		@InjectRepository(MessagesEntity)
		private readonly MatchesHistoryRepository: Repository<MessagesEntity>,
	) { }

	private logger: Logger = new Logger('MatchesHistory');

	public getAllMatchesHistory(): Promise<MessagesEntity[]> {
		return this.MatchesHistoryRepository.find();
	}

	async getUserMatchesHistory(id: number): Promise<MessagesEntity[]> {
		const matches = await this.MatchesHistoryRepository.find({
			where: [
				{ id_sender: id },
				{ id_receiver: id }
			]
		});

		if (!matches)
			return null; // gestion d erreur needed
		return matches;
	}


	//Recuperer les id des joueurs
	//Inserer les datas de base
	async createMatch(body: any): Promise<MessagesEntity> {
		this.logger.log(body);

		// const match = this.MatchesHistoryRepository.save({
		// 	id_user1: body.id_user1,
		// 	score_u1: body.score_u1,
		// 	id_user2: body.id_user2,
		// 	score_u2: body.score_u2,
		// 	winner_id: body.winner_id
		// }
		// )

		const user: MessagesEntity = new MessagesEntity();
		user.id_sender = body.id_sender;
		user.login_sender = body.login_sender;
		user.id_receiver = body.id_receiver;
		user.login_receiver = body.login_receiver;
		user.text = body.text;
		return this.MatchesHistoryRepository.save(user);
	}

}
