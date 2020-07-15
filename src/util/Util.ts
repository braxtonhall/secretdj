import {User, UserTransport} from "../Types";

function isValidUserTransport(user: any): boolean {
	if (user === null || typeof user !== "object") {
		return false;
	}
	for (const key of ["email", "name", "rule1", "rule2", "playlist"]) {
		if (typeof user[key] !== "string") {
			return false;
		}
	}
	return user.rule1 && user.rule2;
}

function toUserTransport(user: User): UserTransport {
	const {email, name, rule1, rule2, playlist} = user;
	return {email, name, rule1, rule2, playlist};
}

export {isValidUserTransport, toUserTransport};
