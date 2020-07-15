import {Next, Request, Response} from "restify";
import {DatabaseController} from "../../../controllers/DatabaseController";
import {toUserTransport} from "../../../util/Util";

/**
 * Lists everyone in the game and their rules, and their playlist if available
 * @param req
 * @param res
 * @param next
 */
async function listParticipants(req: Request, res: Response, next: Next): Promise<void> {
	const users = await DatabaseController.getInstance().listUsers();
	const confirmedUsers = users.filter((user) => user.emailConfirmed);
	const userTransports = confirmedUsers.map(toUserTransport);
	const userTransportsWithoutEmails = userTransports.map((user) => ({...user, email: ''}));
	res.json(200, userTransportsWithoutEmails);
	return next();
}

export default listParticipants;
