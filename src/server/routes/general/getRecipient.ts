import {Next, Request, Response} from "restify";
import {DatabaseController} from "../../../controllers/DatabaseController";
import {getUser} from "../../Auth";
import {toUserTransport} from "../../../util/Util";

/**
 * Gets the current user's target person and their rules
 * Requires
 * @param req
 * @param res
 * @param next
 */
async function getRecipient(req: Request, res: Response, next: Next): Promise<void> {
	const databaseController = DatabaseController.getInstance();
	const userId = getUser(req);
	const currentUser = await databaseController.getUser(userId);
	if (currentUser) {
		const recipientUser = await databaseController.getUser(currentUser.recipient);
		if (recipientUser) {
			res.json(200, {...toUserTransport(recipientUser), email: ''});
		} else {
			res.json(424, {error: "Recipient Not Found"});
		}
	} else {
		res.json(401, {error: "Unauthorized"});
	}
	return next();
}

export default getRecipient;
