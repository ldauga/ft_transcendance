import { ConsoleLogger, Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { removeEmitHelper } from "typescript";
import { RoomsDto } from "./dtos/rooms.dto";
import { RoomsEntity } from "./rooms.entity";
import * as bcrypt from 'bcrypt';

@Injectable()
export class RoomsService {
	constructor(
		@InjectRepository(RoomsEntity)
		private readonly RoomsRepository: Repository<RoomsEntity>,
	) { }

	private logger: Logger = new Logger('Rooms');

	public async getAllRooms(): Promise<{ id: number, name: string, publicOrPrivate: boolean }[]> {
		let arrReturn: { id: number, name: string, publicOrPrivate: boolean, passwordOrNot: boolean }[] = [];
		const returnAll = await this.RoomsRepository.find();
		returnAll.forEach(element => {
			const newRoom = {
				id: element.id,
				name: element.name,
				publicOrPrivate: element.publicOrPrivate,
				passwordOrNot: element.passwordOrNot
			};
			arrReturn.push(newRoom);
		});
		return arrReturn;
	}

	async checkIfCanJoin(user_id: number, user_login: string, room_id: number, room_name: string, password: string): Promise<String> {
		const check = await this.RoomsRepository.findOne({
			where: [
				{ id: room_id, name: room_name }
			]
		});
		if (check == null)
			return ("room not found");
		if (check.passwordOrNot) {;
			const isMatch = await bcrypt.compare(password, check.password);
			if (isMatch)
				return ("ok");
			else
				return ("wrong password");
		}
		return ("ok");
	}

	async checkRoom(nameToCheck: string): Promise<boolean> {
		const check = await this.RoomsRepository.findOne({
			where: [
				{ name: nameToCheck }
			]
		});
		if (check == null)
			return false;
		return true;
	}

	async checkIfOwner(idToCheck: number, nameToCheck: string): Promise<boolean> {
		const check = await this.RoomsRepository.findOne({
			where: [
				{ name: nameToCheck, owner_id: idToCheck }
			]
		});
		if (check == null)
			return false;
		return true;
	}

	async changePassword(room_name: string, passwordOrNot: boolean, password: string): Promise<boolean> {
		console.log("service changePassword, room name: ", room_name)
		if (!this.checkRoom(room_name))
			return false;
		const check = await this.RoomsRepository.findOne({
			where: [
				{ name: room_name }
			]
		});
		console.log("check: ", check);
		check.passwordOrNot = passwordOrNot;

		const saltOrRounds = 10;
		const hash = await bcrypt.hash(password, saltOrRounds);
		check.password = hash;
		
		const returnRoom = this.RoomsRepository.save(check);
		return true;
	}

	async createRoom(body: any): Promise<RoomsEntity> {
		const saltOrRounds = 10;
		const hash = await bcrypt.hash(body.password, saltOrRounds);

		const returnRoom = this.RoomsRepository.save({
			name: body.name,
			description: body.description,
			password: hash,
			identifiant: body.identifiant,
			owner_id: body.owner_id,
			publicOrPrivate: body.publicOrPrivate,
			passwordOrNot: body.passwordOrNot
		})
		if (!returnRoom)
			return null;
		return returnRoom;
	}

	async removeRoom(id_user: number, room_name: string): Promise<boolean> {
		if (!this.checkRoom(room_name))
			return false;
		if (!this.checkIfOwner(id_user, room_name))
			return false;
		const check = await this.RoomsRepository.findOne({
			where: [
				{ name: room_name }
			]
		});
		const removeReturn = this.RoomsRepository.delete(check);
		console.log('removeRoomReturn', removeReturn);
		if (removeReturn)
			return true;
		return false;
	}

	// async getParticipantsRoom(id: number): Promise<number[]> {
	// 	const room = await this.RoomsRepository.findOne({
	// 		where: [
	// 			{ id: id }
	// 		]
	// 	});
	// 	if (!room)
	// 		return null;
	// 	return room.participants_id;
	// }
}
