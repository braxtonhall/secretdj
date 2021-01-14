import {Next, Request, Response} from "restify";
import {DatabaseController, IDatabaseController} from "../../../controllers/DatabaseController";
import {Pair, User} from "../../../Types";
import {EmailController} from "../../../controllers/EmailController";
import {getUser, isAdmin} from "../../Auth";

/**
 * Sends the email to everyone that game has been started
 * Closes registration
 * @param req
 * @param res
 * @param next
 */
async function startExchange(req: Request, res: Response, next: Next): Promise<void> {
	const user = getUser(req);
	if (isAdmin(user)) {
		const success = await handleStartExchange();
		if (success) {
			res.json(200, {result: "Success"});
		} else {
			res.json(400, {error: "Bad Request"});
		}
	} else {
		res.json(401, {error: "Unauthorized"});
	}
	return next();
}

async function handleStartExchange(): Promise<boolean> {
	const databaseController: IDatabaseController = DatabaseController.getInstance();

	const registrationOpen: boolean = await databaseController.isRegistrationOpen();
	if (!registrationOpen) {
		console.warn("Attempted to start game when registration is closed");
		return false;
	}
	await databaseController.closeRegistration();

	const users: User[] = await databaseController.listUsers();
	const confirmedUsers = users.filter((user) => user.emailConfirmed);
	const assignedUsers: Pair[] = createAssignments(confirmedUsers);
	await Promise.all(assignedUsers.map((pair) => databaseController.updateUser(pair.creator)));

	const emailController = EmailController.getInstance();
	await emailController.sendAssignmentEmails(assignedUsers);

	return true;
}

function createAssignments(users: User[]): Pair[] {
	function shuffle<T>(array: T[]): T[] {
		const shuffleArray = [...array];
		for (let i = shuffleArray.length - 1; i > 0; i--) {
			let j = Math.floor(Math.random() * (i + 1));
			[shuffleArray[i], shuffleArray[j]] = [shuffleArray[j], shuffleArray[i]];
		}
		return shuffleArray;
	}

	const shuffledUsers = shuffle(users);
	const pairs: Pair[] = [];

	for (let i = 0; i < shuffledUsers.length; i = i + 1) {
		const creator = shuffledUsers[i];
		const recipient = shuffledUsers[(i + 1) % shuffledUsers.length];
		creator.recipient = recipient.id;
		pairs.push({creator, recipient});
	}

	return pairs;
}

export default startExchange;
