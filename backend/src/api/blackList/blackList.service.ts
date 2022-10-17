import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { BlackListDto } from "./dtos/blackList.dto";
import { BlackListEntity } from "./blackList.entity";

@Injectable()
export class BlackListService {
	constructor(
		@InjectRepository(BlackListEntity)
		private readonly BlackListRepository: Repository<BlackListEntity>,
	) { }

	private logger: Logger = new Logger('BlackList');

	public getAllBan(): Promise<BlackListEntity[]> {
		return this.BlackListRepository.find();
	}

	async checkUserBan(login: string, login_receiver: string): Promise<Boolean> {
		const check = await this.BlackListRepository.findOne({
			where: [
				{ login_banned: login, login_sender: login_receiver }
			]
		});
		if (check == null)
			return false;
		return true;
	}

	async checkRoomBan(id: number, login: string, roomName: string): Promise<Boolean> {
		const check = await this.BlackListRepository.findOne({
			where: [
				{ id_banned: id, login_banned: login, room_name: roomName }
			]
		});
		if (check == null)
			return false;
		return true;
	}

	async createBan(body: any): Promise<BlackListEntity> {
		console.log("createBan");
		const returnBan = this.BlackListRepository.save({
			id_sender: body.id_sender,
			id_banned: body.id_banned,
			login_sender: body.login_sender,
			login_banned: body.login_banned,
			userOrRoom: body.userOrRoom,
			receiver_login: body.receiver_login,
			room_id: body.room_id,
			room_name: body.room_name,
			cause: body.cause
		}
		)
		if (!returnBan)
			return null;
		return returnBan;
	}

	async removeUserBan(id_sender: number, login_banned: string) {
		console.log("removeUserBan");
		const check = await this.BlackListRepository.findOne({
			where: [
				{ id_sender: id_sender, login_banned: login_banned }
			]
		});
		const removeReturn = this.BlackListRepository.delete(check);
		console.log('removeReturn', removeReturn);
	}

	async removeRoomBan(room_id: number, login_banned: string) {
		console.log("removeRoomBan");
		const check = await this.BlackListRepository.findOne({
			where: [
				{ room_id: room_id, login_banned: login_banned }
			]
		});
		const removeReturn = this.BlackListRepository.delete(check);
		console.log('removeReturn', removeReturn);
	}
}