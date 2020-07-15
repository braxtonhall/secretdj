import {Request} from "restify";

function isAdmin(admin: string): boolean {
	const savedAdmin = process.env.ADMIN;
	return admin === savedAdmin;
}

function getUser(req: Request): string {
	return req.headers?.id || '';
}

export {isAdmin, getUser};
