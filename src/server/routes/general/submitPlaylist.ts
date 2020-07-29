import {Next, Request, Response} from "restify";
import {DatabaseController} from "../../../controllers/DatabaseController";
import {EmailController} from "../../../controllers/EmailController";
import {getUser} from "../../Auth";

/**
 * Saves a playlist and sends it to the recipient
 * Should only be possible if registration is closed
 * @param req
 * @param res
 * @param next
 */
async function submitPlaylist(req: Request, res: Response, next: Next): Promise<void> {
	const databaseController = DatabaseController.getInstance();
	const currentUserId = getUser(req);
	const playlist = req.body?.playlist;
	const currentUser = await databaseController.getUser(currentUserId);
	const registrationOpen = await databaseController.isRegistrationOpen();

	if (currentUser && !registrationOpen) {
		if (playlist) {
			const recipient = await databaseController.getUser(currentUser.recipient);
			recipient.playlist = playlist;
			currentUser.done = true;
			await databaseController.updateUser(recipient);
			await databaseController.updateUser(currentUser);
			await EmailController.getInstance().sendPlaylistEmail(recipient);
			res.json(200, {result: "Success"});
		} else {
			res.json(400, {error: "Bad Request"});
		}
	} else {
		res.json(401, {error: "Unauthorized"});
	}
	return next();
}

export default submitPlaylist;
