import {Next, Request, Response} from "restify";
import {DatabaseController} from "../../../controllers/DatabaseController";
import {getUser} from "../../Auth";

/**
 * Sets the user's to an active participant
 * Should be idempotent
 * Error if registration is closed
 * @param req
 * @param res
 * @param next
 */
async function confirmEmail(req: Request, res: Response, next: Next): Promise<void> {
	const databaseController = DatabaseController.getInstance();
	const userId = getUser(req);
	const currentUser = await databaseController.getUser(userId);
	const registrationOpen = await databaseController.isRegistrationOpen();
	if (currentUser && registrationOpen) {
		if (currentUser.emailConfirmed ===  false) {
			await databaseController.writeUser({...currentUser, emailConfirmed: true});
		}
		res.json(200, {result: "Success"});
	} else {
		res.json(401, {error: "Unauthorized"});
	}
	return next();
}

export default confirmEmail;
