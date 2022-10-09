import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { MessagesDto } from "./dtos/messages.dto";
import { MessagesEntity } from "./messages.entity";

@Injectable()
export class MessagesService {
	constructor(
		@InjectRepository(MessagesEntity)
		private readonly MessagesRepository: Repository<MessagesEntity>,
	) { }

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
		let returnArray: { id: number, login: string }[] = [];
		messagesReturn.forEach(item => {
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
			if (!returnFind) {
				returnArray.push({ id: idTmp, login: loginTmp });
			}
		});
		console.log("returnArray : ", returnArray);
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
			text: body.text
		}
		)
		if (!newMessage)
			return null;
		return newMessage;
	}
}
