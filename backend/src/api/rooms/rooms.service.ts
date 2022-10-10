import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { removeEmitHelper } from "typescript";
import { RoomsDto } from "./dtos/rooms.dto";
import { RoomsEntity } from "./rooms.entity";

@Injectable()
export class RoomsService {
	constructor(
		@InjectRepository(RoomsEntity)
		private readonly RoomsRepository: Repository<RoomsEntity>,
	) { }

	private logger: Logger = new Logger('Rooms');

	public async getAllRooms(): Promise<{ id: number, name: string }[]> {
		let arrReturn: { id: number, name: string }[] = [];
		const returnAll = await this.RoomsRepository.find();
		returnAll.forEach(element => {
			const newRoom = {
				id: element.id,
				name: element.name
			};
			arrReturn.push(newRoom);
		});
		return arrReturn;
	}

	public async getAllRooms2(): Promise<string[]> {
		let arrReturn: string[] = [];
		const returnAll = await this.RoomsRepository.find();
		returnAll.forEach(element => {
			const newRoom = {
				id: element.id,
				name: element.name
			}
		});
		return arrReturn;
	}

	async checkRoom(nameToCheck: string): Promise<Boolean> {
		const check = await this.RoomsRepository.findOne({
			where: [
				{ name: nameToCheck }
			]
		});
		if (check == null)
			return false;
		return true;
	}

	async checkIfOwner(idToCheck: number, nameToCheck: string): Promise<Boolean> {
		const check = await this.RoomsRepository.findOne({
			where: [
				{ name: nameToCheck, owner_id: idToCheck }
			]
		});
		if (check == null)
			return false;
		return true;
	}

	async createRoom(body: any): Promise<RoomsEntity> {
		const returnRoom = this.RoomsRepository.save({
			name: body.name,
			description: body.description,
			password: body.password,
			identifiant: body.identifiant,
			owner_id: body.owner_id
		})
		if (!returnRoom)
			return null;
		return returnRoom;
	}

	async removeRoom(id_user: number, room_name: string): Promise<Boolean> {
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
