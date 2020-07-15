import {Server} from "restify";
import startExchange from "./admin/startExchange";
import sendReminders from "./admin/sendReminders";

function registerAdminRoutes(server: Server) {
	server.post("/start", startExchange);
	server.post("/reminder", sendReminders);
}

export {registerAdminRoutes};
