import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { InvitationRequestDto } from "./dtos/invitationRequest.dto";
import { InvitationRequestEntity } from "./invitationRequest.entity";

@Injectable()
export class invitationRequestService {
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
			return null; // gestion d erreur needed
		return invit;
	}

	async checkInvitationRequest(id1: number, id2: number): Promise<Boolean> {
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

	async createInvitationRequest(body: any): Promise<InvitationRequestEntity> {
		const returnInvitationRequest = this.InvitationRequestRepository.save({
			id_user1: body.id_user1,
			id_user2: body.id_user2,
			user1_accept: body.user1_accept,
			user2_accept: body.user2_accept,
			sender_login: body.sender_login,
			receiver_login: body.receiver_login
		}
		)
		if (!returnInvitationRequest)
			return null;
		return returnInvitationRequest;
	}

	async removeInvitationRequest(id1: number, id2: number) {
		console.log("removeInvitationRequest");
		const check = await this.InvitationRequestRepository.findOne({
			where: [
				{ id_user1: id1, id_user2: id2 }
			]
		});
		const removeReturn = this.InvitationRequestRepository.delete(check);
		console.log('removeReturn', removeReturn);
	}

}
