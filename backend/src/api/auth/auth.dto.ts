import { IsString } from "class-validator";

export class Auth42DTO {
	@IsString()
	code: string;

	nickname?: string
}
