import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { MuteListDto } from "./dtos/muteList.dto";
import { MuteListController } from "./muteList.controller";
import { MuteListEntity } from "./muteList.entity";

@Injectable()
export class MuteListService {
	constructor(
		@InjectRepository(MuteListEntity)
		private readonly MuteListRepository: Repository<MuteListEntity>,
	) { }

	private logger: Logger = new Logger('MuteList');

	public async getAllMuteTimer(): Promise<{ login_muted: string, userOrRoom: boolean, id_sender: number, room_id: number, date: number, timer: number }[]> {
		let arrReturn: { login_muted: string, userOrRoom: boolean, id_sender: number, room_id: number, date: number, timer: number }[] = [];
		const returnAll = await this.MuteListRepository.find();
		returnAll.forEach(element => {
			const newMute = {
				login_muted: element.login_muted,
				userOrRoom: element.userOrRoom,
				id_sender: element.id_sender,
				room_id: element.room_id,
				date: element.date,
				timer: element.timer
			};
			arrReturn.push(newMute);
		});
		return arrReturn;
	}

	async checkUserMute(login: string, login_receiver: string): Promise<Boolean> {
		const check = await this.MuteListRepository.findOne({
			where: [
				{ login_muted: login, login_sender: login_receiver }
			]
		});
		if (check == null)
			return false;
		return true;
	}

	async checkRoomMute(id: number, login: string, roomName: string): Promise<Boolean> {
		const check = await this.MuteListRepository.findOne({
			where: [
				{ id_muted: id, login_muted: login, room_name: roomName }
			]
		});
		if (check == null)
			return false;
		return true;
	}

	async createMute(body: any): Promise<MuteListEntity> {
		console.log("createMute");
		const returnMute = this.MuteListRepository.save({
			id_sender: body.id_sender,
			id_muted: body.id_muted,
			login_sender: body.login_sender,
			login_muted: body.login_muted,
			userOrRoom: body.userOrRoom,
			receiver_login: body.receiver_login,
			room_id: body.room_id,
			room_name: body.room_name,
			cause: body.cause,
			date: body.date,
			alwaysOrNot: body.alwaysOrNot,
			timer: body.timer
		}
		)
		if (!returnMute)
			return null;
		return returnMute;
	}

	async removeUserMute(id_sender: number, login_muted: string) {
		console.log("removeUserMute");
		const check = await this.MuteListRepository.findOne({
			where: [
				{ id_sender: id_sender, login_muted: login_muted }
			]
		});
		const removeReturn = this.MuteListRepository.delete(check);
		console.log('removeReturn', removeReturn);
	}

	async removeRoomMute(room_id: number, login_muted: string) {
		console.log("removeRoomMute");
		const check = await this.MuteListRepository.findOne({
			where: [
				{ room_id: room_id, login_muted: login_muted }
			]
		});
		const removeReturn = this.MuteListRepository.delete(check);
		console.log('removeReturn', removeReturn);
	}
}
