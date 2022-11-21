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
			return null;
		return matches;
	}

	async getUserFriendListWithLogin(login: string): Promise<FriendListEntity[]> {
		const matches = await this.FriendListRepository.find({
			where: [
				{ login_user1: login },
				{ login_user2: login }
			]
		});
		if (!matches)
			return null;
		return matches;
	}

	async checkExistRelation(id1: number, id2: number): Promise<boolean> {
		const returnCheck = await this.FriendListRepository.findOne({
			where: [
				{ id_user1: id1, id_user2: id2 },
				{ id_user1: id2, id_user2: id1 }
			]
		});
		if (!returnCheck)
			return false;
		return true;
	}

	async createFriendShip(body: any): Promise<FriendListEntity> {
		const match = this.FriendListRepository.save({
			id_user1: body.id_user1,
			id_user2: body.id_user2,
			login_user1: body.login_user1,
			login_user2: body.login_user2
		});

		if (!match)
			return null;
		return match;
	}

	async removeFriendShip(id1: number, id2: number): Promise<boolean> {
		if (!this.checkExistRelation(id1, id2))
			return false;
		let v = false;
		const check = await this.FriendListRepository.findOneBy({ id_user1: id1, id_user2: id2 });
		if (check) {
			const removeReturn = this.FriendListRepository.delete(check);
			if (removeReturn)
				v = true;
		}
		const check2 = await this.FriendListRepository.findOneBy({ id_user1: id2, id_user2: id1 });
		if (check2) {
			const removeReturn2 = this.FriendListRepository.delete(check2);
			if (removeReturn2)
				v = true;
		}
		if (v)
			return true;
		else
			return false;
	}
}
