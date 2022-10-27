import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { stringify } from "querystring";
import { Repository } from "typeorm";
import { UserService } from "../user/user.service";
import { MessagesDto } from "./dtos/messages.dto";
import { MessagesEntity } from "./messages.entity";

@Injectable()
export class MessagesService {
	constructor(
		@InjectRepository(MessagesEntity)
		private readonly MessagesRepository: Repository<MessagesEntity>,
	) { }

	private readonly UserService: UserService

	private logger: Logger = new Logger('Messages');

	public getAllMessages(): Promise<MessagesEntity[]> {
		return this.MessagesRepository.find();
	}

	async getUserMessages(id: number): Promise<MessagesEntity[]> {
		const messagesReturn = await this.MessagesRepository.find({
			where: [
				{ id_sender: id },
				{ id_receiver: id }
			]
		});

		if (!messagesReturn)
			return null;
		return messagesReturn;
	}

	async getConversMessages(id1: number, id2: number): Promise<MessagesEntity[]> {
		const messagesReturn = await this.MessagesRepository.find({
			where: [
				{ id_sender: id1, id_receiver: id2 },
				{ id_sender: id2, id_receiver: id1 }
			]
		});

		if (!messagesReturn)
			return null;
		return messagesReturn;
	}

	async getRoomConversMessages(id: number): Promise<MessagesEntity[]> {
		const messagesReturn = await this.MessagesRepository.find({
			where: [
				{ room_id: id }
			]
		});
		if (!messagesReturn)
			return null;
		return messagesReturn;
	}

	async getRelationMessages(id: number): Promise<any[]> {
		const messagesReturn = await this.MessagesRepository.find({
			where: [
				{ id_sender: id },
				{ id_receiver: id }
			]
		});
		let returnArray: { id: number, login: string, nickname: string, profile_pic: string; userOrRoom: boolean, room_id: number, room_name: string }[] = [];
		messagesReturn.forEach(async item => {
			if (!item.userOrRoom) {
				let idTmp;
				let loginTmp;
				if (item.id_receiver == id) {
					idTmp = item.id_sender;
					loginTmp = item.login_sender;
				}
				else {
					idTmp = item.id_receiver;
					loginTmp = item.login_receiver;
				}
				let returnFind = returnArray.find(item => item.id == idTmp);
				//const user = await this.UserService.getUserById(idTmp);
				if (!returnFind) {
					returnArray.push({ id: idTmp, login: loginTmp, nickname: "", profile_pic: "", userOrRoom: false, room_id: 0, room_name: "" });
				}
			}
			else {
				let roomIdTmp = item.room_id;
				let roomNameTmp = item.room_name;
				let returnFind = returnArray.find(item => item.room_id == roomIdTmp);
				if (!returnFind) {
					returnArray.push({ id: 0, login: "", nickname: "", profile_pic: "", userOrRoom: true, room_id: roomIdTmp, room_name: roomNameTmp });
				}
			}
		});
		//console.log("returnArray : ", returnArray);
		if (!returnArray)
			return null;
		return returnArray;
	}

	async createMessages(body: any): Promise<MessagesEntity> {
		this.logger.log(body);

		const newMessage = this.MessagesRepository.save({
			id_sender: body.id_sender,
			id_receiver: body.id_receiver,
			login_sender: body.login_sender,
			login_receiver: body.login_receiver,
			userOrRoom: body.userOrRoom,
			room_id: body.room_id,
			room_name: body.room_name,
			text: body.text,
			year: body.year,
			month: body.month,
			day: body.day,
			hour: body.hour,
			minute: body.minute
		}
		)
		if (!newMessage)
			return null;
		return newMessage;
	}

	async removeAllRoomMessages(room_id: number, room_name: string): Promise<boolean> {
		console.log("removeAllRoomMessages room: ", room_name);
		if (room_id == 0)
			return false;
		const secu = 20000;
		let messageReturn = await this.MessagesRepository.findOne({
			where: [
				{ room_id: room_id },
				{ room_name: room_name }
			]
		});
		while (secu >= 0 && messageReturn) {
			const removeReturn = this.MessagesRepository.delete(messageReturn);
			messageReturn = await this.MessagesRepository.findOne({
				where: [
					{ room_id: room_id },
					{ room_name: room_name }
				]
			});
		}
		console.log(20000 - secu, " messages deleted");
		return (true);
	}
}
