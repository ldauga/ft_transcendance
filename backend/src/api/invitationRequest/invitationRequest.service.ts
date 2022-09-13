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
		const matches = await this.InvitationRequestRepository.find({
			where: [
				{ id_user1: id },
				{ id_user2: id }
			]
		});

		if (!matches)
			return null; // gestion d erreur needed
		return matches;
	}


	//Recuperer les id des joueurs
	//Inserer les datas de base
	async createInvitationRequest(body: any): Promise<InvitationRequestEntity> {
		this.logger.log(body);

		const match = this.InvitationRequestRepository.save({
			id_user1: body.id_user1,
			id_user2: body.id_user2,
			user1_accept: body.user1_accept,
			user2_accept: body.user2_accept
		}
		)
		if (!match)
			return null;
		return match;
	}

}
