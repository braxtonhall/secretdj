import {config} from "dotenv";
config();

import Server from "./server/Server";
// import {DatabaseController} from "./controllers/DatabaseController"; // TODO

/**
 * Main app class that is run with the node command. Starts the server.
 */
export class App {
	public initServer(port: number) {
		const server = new Server(port);
		server.start().then((val: boolean) => {
			console.log("App::initServer() - started: ", val, "- Port:", port);
		// }).then(() => { // TODO
		// 	return DatabaseController.getInstance().forceInit();
		}).catch(function (err: Error) {
			console.log("App::initServer() - ERROR: " + err.message);
		});
	}
}

const app = new App();
app.initServer(Number(process.env.PORT) || 8080);
