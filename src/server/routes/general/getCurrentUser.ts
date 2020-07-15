import {Next, Request, Response} from "restify";
import {User} from "../../../Types";
import {DatabaseController} from "../../../controllers/DatabaseController";
import {toUserTransport} from "../../../util/Util";
import {getUser} from "../../Auth";

/**
 * Gets the current user and their rules, and whether or not their email is confirmed
 * @param req
 * @param res
 * @param next
 */
async function getCurrentUser(req: Request, res: Response, next: Next): Promise<void> {
	const userId = getUser(req);
	const user: User = await DatabaseController.getInstance().getUser(userId);
	if (user) {
		res.json(200, toUserTransport(user));
	} else {
		res.json(424, {error: "User Not Found"});
	}
	return next();
}

export default getCurrentUser;
