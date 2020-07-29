import {Next, Request, Response} from "restify";
import {DatabaseController} from "../../../controllers/DatabaseController";
import {isValidUserTransport, toUserTransport} from "../../../util/Util";
import {getUser} from "../../Auth";

/**
 * Allows a user to change their name, or their rules
 * @param req
 * @param res
 * @param next
 */
async function editUser(req: Request, res: Response, next: Next): Promise<void> {
	const databaseController = DatabaseController.getInstance();
	const userId = getUser(req);
	const newUser = req.body;
	const currentUser = await databaseController.getUser(userId);
	const registrationOpen = await databaseController.isRegistrationOpen();
	if (currentUser && registrationOpen) {
		if (isValidUserTransport(newUser) && newUser.playlist === '') {
			await databaseController.updateUser({...currentUser, ...toUserTransport(newUser)});
			res.json(200, {result: "Success"});
		} else {
			res.json(400, {error: "Bad Request"});
		}
	} else {
		res.json(401, {error: "Unauthorized"});
	}
	return next();
}

export default editUser;
