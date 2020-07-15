import {Next, Request, Response} from "restify";
import {isValidUserTransport, toUserTransport} from "../../../util/Util";
import {DatabaseController} from "../../../controllers/DatabaseController";
import {User} from "../../../Types";
import {EmailController} from "../../../controllers/EmailController";

/**
 * Saves a user's email, name, and two rules
 * Error if email already in use or is invalid
 * Error if rules are empty
 * Error if registration is closed
 * @param req
 * @param res
 * @param next
 */
async function addParticipant(req: Request, res: Response, next: Next): Promise<void> {
	const newUser = req.body;
	if (isValidUserTransport(newUser) && newUser.playlist === '' && isValidEmail(newUser.email)) {
		const databaseController = DatabaseController.getInstance();
		const registrationOpen = databaseController.isRegistrationOpen();
		if (registrationOpen) {
			const idSeed = await databaseController.tick();
			const id: string = createID(idSeed);
			const emailConfirmed = false;
			const recipient = '';
			const done = false;
			const user: User = {...toUserTransport(newUser), id, recipient, emailConfirmed, done};
			await databaseController.writeUser(user);
			await EmailController.getInstance().sendConfirmationEmail(user);
			res.json(200, {result: "Success"});
		} else {
			res.json(401, {error: "Unauthorized"});
		}
	} else {
		res.json(400, {error: "Bad Request"});
	}
	return next();
}

function isValidEmail(email: string): boolean {
	return /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
		.test(email);
}

function createID(seed: number): string {

	function hashID(id: string): string {
		// https://gist.github.com/iperelivskiy/4110988
		let a = 1, c = 0, h, o;
		if (id) {
			a = 0;
			for (h = id.length - 1; h >= 0; h--) {
				o = id.charCodeAt(h);
				a = (a << 6 & 268435455) + o + (o << 14);
				c = a & 266338304;
				a = c !== 0 ? a ^ c >> 21 : a;
			}
		}
		return String(a);
	}

	function getRandomLongString(): string {
		const stringLength = 32;
		const chars = "QWERTYUIOPASDFGHJKLZXCVBNM1234567890";
		let key = "";
		while (key.length < stringLength) {
			key += chars.charAt(Math.floor(Math.random() * chars.length));
		}
		return key;
	}

	return `${hashID(String(seed))}${getRandomLongString()}`;
}

export default addParticipant;
