import {Server} from "restify";
import {Client} from "discord.js";
import listParticipants from "./listParticipants";

function registerRoutes(server: Server, client: Client) {
	server.get("/list", listParticipants(client));
}

export {registerRoutes};
