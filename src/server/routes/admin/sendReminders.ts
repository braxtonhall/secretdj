import {Next, Request, Response} from "restify";
import {DatabaseController, IDatabaseController} from "../../../controllers/DatabaseController";
import {User} from "../../../Types";
import {EmailController} from "../../../controllers/EmailController";
import {getUser, isAdmin} from "../../Auth";

async function sendReminders(req: Request, res: Response, next: Next): Promise<void> {
	const user = getUser(req);
	const message = req.body?.message ?? "";
	if (isAdmin(user)) {
		const reminderCount = await handleSendReminders(message);
		if (reminderCount >= 0) {
			res.json(200, {count: reminderCount});
		} else {
			res.json(400, {error: "Bad Request"});
		}
	} else {
		res.json(401, {error: "Unauthorized"});
	}
	return next();
}

async function handleSendReminders(message: string): Promise<number> {
	const databaseController: IDatabaseController = DatabaseController.getInstance();

	const registrationOpen: boolean = await databaseController.isRegistrationOpen();
	if (registrationOpen) {
		console.warn("Attempted to send reminders before registration is over");
		return -1;
	}

	const users: User[] = await databaseController.listUsers();
	const unfinishedUsers = users.filter((user) => user.emailConfirmed && !user.done);

	const emailController = EmailController.getInstance();
	await emailController.sendReminderEmails(unfinishedUsers, message);

	return unfinishedUsers.length;
}

export default sendReminders;
