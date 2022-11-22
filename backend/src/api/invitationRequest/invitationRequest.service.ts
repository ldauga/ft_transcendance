import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { InvitationRequestDto } from "./dtos/invitationRequest.dto";
import { InvitationRequestEntity } from "./invitationRequest.entity";

@Injectable()
export class InvitationRequestService {
	constructor(
		@InjectRepository(InvitationRequestEntity)
		private readonly InvitationRequestRepository: Repository<InvitationRequestEntity>,
	) { }

	private logger: Logger = new Logger('InvitationRequest');

	public getAllInvitationRequest(): Promise<InvitationRequestEntity[]> {
		return this.InvitationRequestRepository.find();
	}

	async getUserInvitationRequest(id: number): Promise<InvitationRequestEntity[]> {
		const invit = await this.InvitationRequestRepository.find({
			where: [
				{ id_user2: id }
			]
		});

		if (!invit)
			return [];
		return invit;
	}

	async getAllUserInvitationByLogin(login: string): Promise<InvitationRequestEntity[]> {
		const invit = await this.InvitationRequestRepository.find({
			where: [
				{ sender_login: login },
				{ receiver_login: login }
			]
		});

		if (!invit)
			return null;
		return invit;
	}

	async checkInvitationRequest(id1: number, id2: number): Promise<boolean> {
		const check = await this.InvitationRequestRepository.findOne({
			where: [
				{ id_user1: id1, id_user2: id2 },
				{ id_user1: id2, id_user2: id1 }
			]
		});
		if (check == null)
			return false;
		if (id1 == id2)
			return false;
		return true;
	}

	async checkInvitationRequestForRooms(id: number, roomName: string): Promise<boolean> {
		const check = await this.InvitationRequestRepository.findOneBy({ id_user2: id, room_name: roomName });
		if (check == null)
			return false;
		return true;
	}

	async createInvitationRequest(body: any): Promise<InvitationRequestEntity> {
		const returnInvitationRequest = this.InvitationRequestRepository.save({
			id_user1: body.id_user1,
			id_user2: body.id_user2,
			user1_accept: body.user1_accept,
			user2_accept: body.user2_accept,
			sender_login: body.sender_login,
			receiver_login: body.receiver_login,
			userOrRoom: body.userOrRoom,
			room_id: body.room_id,
			room_name: body.room_name,
			publicOrPrivate: body.publicOrPrivate
		}
		)
		if (!returnInvitationRequest)
			return null;
		return returnInvitationRequest;
	}

	async removeInvitationRequest(id1: number, id2: number): Promise<boolean> {
		const check = await this.InvitationRequestRepository.findOneBy({ id_user1: id1, id_user2: id2 });
		const removeReturn = this.InvitationRequestRepository.delete(check);
		if (removeReturn)
			return true;
		return false;
	}

}
