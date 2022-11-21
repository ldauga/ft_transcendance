import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { stringify } from "querystring";
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

	public async getAllMuteTimer(): Promise<{ login_muted: string, userOrRoom: boolean, id_sender: number, login_sender: string, room_id: number, alwaysOrNot: boolean, date: number, timer: number }[]> {
		let arrReturn: { login_muted: string, userOrRoom: boolean, id_sender: number, login_sender: string, room_id: number, alwaysOrNot: boolean, date: number, timer: number }[] = [];
		const returnAll = await this.MuteListRepository.find();
		returnAll.forEach(element => {
			const newMute = {
				login_muted: element.login_muted,
				userOrRoom: element.userOrRoom,
				id_sender: element.id_sender,
				login_sender: element.login_sender,
				room_id: element.room_id,
				alwaysOrNot: element.alwaysOrNot,
				date: element.date,
				timer: element.timer
			};
			arrReturn.push(newMute);
		});
		return arrReturn;
	}

	public async getAllRoomMute(room_id: number, room_name: string): Promise<{ id_muted: number, login_muted: string }[]> {
		let arrReturn: { id_muted: number, login_muted: string }[] = [];
		const returnAll = await this.MuteListRepository.find({
			where: [
				{ room_id: room_id, room_name: room_name }
			]
		});
		returnAll.forEach(element => {
			const newMute = {
				id_muted: element.id_muted,
				login_muted: element.login_muted
			};
			arrReturn.push(newMute);
		});
		return arrReturn;
	}

	async checkUserMute(login: string, login_receiver: string): Promise<boolean> {
		const check = await this.MuteListRepository.findOneBy({ login_muted: login, login_sender: login_receiver });
		if (check == null)
			return false;
		return true;
	}

	async checkRoomMute(id: number, login: string, roomName: string): Promise<boolean> {
		const check = await this.MuteListRepository.findOneBy({ id_muted: id, login_muted: login, room_name: roomName });
		if (check == null)
			return false;
		return true;
	}

	async createMute(body: any): Promise<MuteListEntity> {
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

	async removeUserMute(id_sender: number, login_muted: string): Promise<boolean> {
		const check = await this.MuteListRepository.findOneBy({ id_sender: id_sender, login_muted: login_muted });
		if (check) {
			const removeReturn = this.MuteListRepository.delete(check);
			if (removeReturn)
				return true;
			else
				return false;
		}
		else
			return false;
	}

	async removeRoomMute(room_id: number, login_muted: string): Promise<boolean> {
		const check = await this.MuteListRepository.findOneBy({ room_id: room_id, login_muted: login_muted });
		if (check) {
			const removeReturn = this.MuteListRepository.delete(check);
			if (removeReturn)
				return true;
			else
				return false;
		}
		else
			return false;
	}
}
