import {Next, Request, Response} from "restify";
import {DatabaseController} from "../../../controllers/DatabaseController";

async function getRegistrationStatus(req: Request, res: Response, next: Next): Promise<void> {
	const open: boolean = await DatabaseController.getInstance().isRegistrationOpen();
	res.json(200, {open});
	return next();
}

export default getRegistrationStatus;
