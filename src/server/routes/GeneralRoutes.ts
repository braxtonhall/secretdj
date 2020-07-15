import {Server} from "restify";
import addParticipant from "./general/addParticipant";
import confirmEmail from "./general/confirmEmail";
import editUser from "./general/editUser";
import submitPlaylist from "./general/submitPlaylist";
import getRecipient from "./general/getRecipient";
import getCurrentUser from "./general/getCurrentUser";
import listParticipants from "./general/listParticipants";
import getRegistrationStatus from "./general/getRegistrationStatus";

function registerGeneralRoutes(server: Server) {
	server.post("/new", addParticipant);
	server.post("/confirm", confirmEmail);
	server.post("/edit", editUser);
	server.post("/playlist", submitPlaylist);

	server.get("/recipient", getRecipient);
	server.get("/user", getCurrentUser);
	server.get("/list", listParticipants);
	server.get("/registration", getRegistrationStatus);
}

export {registerGeneralRoutes};
