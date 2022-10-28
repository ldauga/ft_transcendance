import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UserService } from "../user/user.service";
import { ParticipantsDto } from "./dtos/participants.dto";
import { ParticipantsEntity } from "./participants.entity";

@Injectable()
export class ParticipantsService {
	constructor(
		@InjectRepository(ParticipantsEntity)
		private readonly ParticipantsRepository: Repository<ParticipantsEntity>,
	) { }

	private logger: Logger = new Logger('participants');

	private readonly UserService: UserService

	public async getAllParticipants(): Promise<{ login: string, room_name: string }[]> {
		let arrReturn: { login: string, room_name: string }[] = [];
		const returnAll = await this.ParticipantsRepository.find();
		returnAll.forEach(element => {
			const newParticipant = {
				login: element.user_login,
				room_name: element.room_name
			};
			arrReturn.push(newParticipant);
		});
		return arrReturn;
	}

	public async getAllRoomParticipants(id: number): Promise<ParticipantsEntity[]> {
		const participants = await this.ParticipantsRepository.find({
			where: [
				{ room_id: id }
			]
		});
		if (!participants)
			return null;
		return participants;
	}

	async checkParticipant(login: string, roomName: string): Promise<boolean> {
		const check = await this.ParticipantsRepository.findOne({
			where: [
				{ user_login: login, room_name: roomName }
			]
		});
		if (check == null)
			return false;
		return true;
	}

	async checkAdmin(login: string, roomName: string): Promise<boolean> {
		const check = await this.ParticipantsRepository.findOne({
			where: [
				{ user_login: login, room_name: roomName }
			]
		});
		if (check == null)
			return false;
		if (check.admin)
			return true;
		else
			return false;
	}

	async checkIfAdminOrParticipant(login: string, roomName: string): Promise<boolean> {
		const check = await this.ParticipantsRepository.findOne({
			where: [
				{ user_login: login, room_name: roomName }
			]
		});
		if (check == null)
			return false;
		if (check.admin)
			return false;
		else
			return true;
	}

	async createAdmin(body: any): Promise<ParticipantsEntity> {
		const returnRemoveParticipant = this.removeParticipant(body.user_login, body.room_name);
		console.log("returnRemoveParticipant service: ", returnRemoveParticipant);
		if (!returnRemoveParticipant)
			return null;
		const newParticipant = {
			user_id: body.user_id,
			user_login: body.user_login,
			room_id: body.room_id,
			room_name: body.room_name,
			admin: true,
			publicOrPrivate: body.publicOrPrivate
		};
		const returnParticipant = this.createParticipant(newParticipant);
		console.log("returnParticipant service: ", returnParticipant);
		if (!returnParticipant)
			return null;
		return returnParticipant;
	}

	async removeAdmin(body: any): Promise<ParticipantsEntity> {
		const returnRemoveParticipant = this.removeParticipant(body.user_login, body.room_name);
		console.log("returnRemoveParticipant service: ", returnRemoveParticipant);
		if (!returnRemoveParticipant)
			return null;
		const newParticipant = {
			user_id: body.user_id,
			user_login: body.user_login,
			room_id: body.room_id,
			room_name: body.room_name,
			admin: false,
			publicOrPrivate: body.publicOrPrivate
		};
		const returnParticipant = this.createParticipant(newParticipant);
		console.log("returnParticipant service: ", returnParticipant);
		if (!returnParticipant)
			return null;
		return returnParticipant;
	}

	async createParticipant(body: any): Promise<ParticipantsEntity> {
		const returnParticipant = this.ParticipantsRepository.save({
			user_id: body.user_id,
			user_login: body.user_login,
			room_id: body.room_id,
			room_name: body.room_name,
			admin: body.admin,
			publicOrPrivate: body.publicOrPrivate
		})
		console.log("returnParticipant service: ", returnParticipant);
		if (!returnParticipant)
			return null;
		return returnParticipant;
	}

	async removeParticipant(login: string, room_name: string): Promise<boolean> {
		if (!this.checkParticipant(login, room_name))
			return false;
		const check = await this.ParticipantsRepository.findOne({
			where: [
				{ user_login: login, room_name: room_name }
			]
		});
		const removeReturn = this.ParticipantsRepository.delete(check);
		console.log('removeParticipantReturn', removeReturn);
		return true;
	}

	public async getAllUsersForOneRoom(name: string): Promise<{ login: string, id: number, admin: boolean }[]> {
		const participants = await this.ParticipantsRepository.find({
			where: [
				{ room_name: name }
			]
		});
		let arrParticipants: { login: string, id: number, admin: boolean }[] = [];
		if (!participants)
			return arrParticipants;
		participants.forEach(item => (arrParticipants.push({ login: item.user_login, id: item.user_id, admin: item.admin })));
		return arrParticipants;
	}

	// public async getAllUsersForRoom(name: string): Promise<{ id: number, login: string, nickname: string, profile_pic: string }[]> {
	// 	const participants = await this.ParticipantsRepository.find({
	// 		where: [
	// 			{ room_name: name }
	// 		]
	// 	});
	// 	let arrParticipants: { login: string, id: number }[] = [];
	// 	console.log("participants: ", participants);
	// 	if (!participants)
	// 		return null;
	// 	await participants.forEach(item => (arrParticipants.push({ login: item.user_login, id: item.user_id })));
	// 	let arrUsers: { id: number, login: string, nickname: string, profile_pic: string }[] = [];
	// 	await arrParticipants.forEach(async item => {
	// 		console.log("test1");
	// 		const user = await this.UserService.getUserById(item.id);
	// 		console.log("user: ", user);
	// 		arrUsers.push({ id: user.id, login: user.login, nickname: user.nickname, profile_pic: user.profile_pic });
	// 	});
	// 	console.log("arrUsers: ", arrUsers);
	// 	return arrUsers;
	// }

	public async getAllRoomUser(login: string): Promise<{ name: string, id: number }[]> {
		const participants = await this.ParticipantsRepository.find({
			where: [
				{ user_login: login }
			]
		});
		let arrRooms: { name: string, id: number }[] = [];
		if (!participants)
			return arrRooms;
		participants.forEach(item => (arrRooms.push({ name: item.room_name, id: item.room_id })));
		return arrRooms;
	}
}
