import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { FriendListDto } from "./dtos/friendList.dto";
import { FriendListEntity } from "./friendList.entity";

@Injectable()
export class FriendListService {
	constructor(
		@InjectRepository(FriendListEntity)
		private readonly FriendListRepository: Repository<FriendListEntity>,
	) { }

	private logger: Logger = new Logger('FriendList');

	public getAllFriendList(): Promise<FriendListEntity[]> {
		return this.FriendListRepository.find();
	}

	async getUserFriendList(id: number): Promise<FriendListEntity[]> {
		const matches = await this.FriendListRepository.find({
			where: [
				{ id_user1: id },
				{ id_user2: id }
			]
		});

		if (!matches)
			return null; // gestion d erreur needed
		return matches;
	}


	//Recuperer les id des joueurs
	//Inserer les datas de base
	async createFriendShip(body: any): Promise<FriendListEntity> {
		this.logger.log(body);

		const match = this.FriendListRepository.save({
			id_user1: body.id_user1,
			id_user2: body.id_user2,
		}
		)
		if (!match)
			return null;
		return match;
	}

}
