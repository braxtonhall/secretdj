import {createServer, plugins, Server as _Server} from "restify";
import {Client} from "discord.js";
import {registerRoutes} from "./routes/registerRoutes";

export default class Server {

    private server: _Server;

    constructor(private port: number, private client: Client) {}

    public stop(): Promise<boolean> {
        return new Promise( (resolve) => {
            this.server.close(() => {
                resolve(true);
            });
        });
    }

    public start(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            try {
                this.server = createServer({
                    name: "secretdj",
                });
                this.server.use(plugins.bodyParser({mapFiles: true, mapParams: true}));
                this.server.use((req, res, next) => {
                    res.header("Access-Control-Allow-Origin", "*");
                    res.header("Access-Control-Allow-Headers", "X-Requested-With");
                    return next();
                });

                registerRoutes(this.server, this.client);

                const frontend = "./frontend";
                this.server.get('/*/', plugins.serveStatic({
                    directory: frontend,
                    default:   'html/index.html'
                }));

                this.server.listen(this.port, () => {
                    resolve(true);
                });

                this.server.on("error", (err: string) => {
                    reject(err);
                });

            } catch (err) {
                reject(err);
            }
        });
    }
}
